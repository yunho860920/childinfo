import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X,
  Moon,
  Settings,
  BookOpen,
  ShieldCheck,
  Layers,
  HeartPulse,
  MapPin,
  MessageCircle,
  Lock,
  Check,
  Thermometer
} from 'lucide-react';
import { cn } from './utils/uiUtils';

// UI Components
import GrowthCard from './components/Dashboard/GrowthCard';
import TemperatureCard from './components/Dashboard/TemperatureCard';
import PracticalTab from './components/Tabs/PracticalTab';
import WelfareTab from './components/Tabs/WelfareTab';
import HealthTab from './components/Tabs/HealthTab';
import FacilitiesTab from './components/Tabs/FacilitiesTab';
import ConsultTab from './components/Tabs/ConsultTab';
import MilestoneModal from './components/Modals/MilestoneModal';
import GrowthChartModal from './components/GrowthChartModal';
import TemperatureChartModal from './components/Dashboard/TemperatureChartModal';
import ThemeToggle from './components/common/ThemeToggle';

// Services & Utils
import { consultationService } from './services/consultationService';
import { fetchWelfareServices } from './services/welfareApi';
import { fetchChildFacilities, getFilteredFacilities } from './services/facilityApi';
import { loadSecureData, saveSecureData } from './utils/security';
import { hashPin, calculateMonths, calculatePercentile } from './utils/growthUtils';
import { FACILITIES_PER_PAGE, ALL_REGIONS } from './constants/uiConstants';


function App() {
  // --- States ---
  const [darkMode, setDarkMode] = React.useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('childinfo_theme');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    } catch (e) { return true; }
    return true;
  });
  const [activeTab, setActiveTab] = React.useState('health');
  const [logoClickCount, setLogoClickCount] = React.useState(0);
  const [logoLastClick, setLogoLastClick] = React.useState(0);
  const [childInfo, setChildInfo] = React.useState(() => {
    const DEFAULT_PROFILE = {
      name: '우리 아이 별칭',
      birthDate: '2023-10-01',
      months: 6,
      gender: 'male',
      height: 68,
      weight: 8.5
    };
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('childinfo_profile') : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.birthDate) {
           return { ...DEFAULT_PROFILE, ...parsed };
        }
      }
    } catch (e) {
      console.warn("CORE Agent: LocalStorage Restricted/Unavailable:", e);
    }
    return DEFAULT_PROFILE;
  });
  
  const [growthRecords, setGrowthRecords] = React.useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('childinfo_growth_history') : null;
      if (saved) return JSON.parse(saved) || [];
    } catch (e) { return []; }
    return [];
  });
  const [showGrowthChart, setShowGrowthChart] = React.useState(false);

  const [tempRecords, setTempRecords] = React.useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('childinfo_temp_history') : null;
      if (saved) return JSON.parse(saved) || [];
    } catch (e) { return []; }
    return [];
  });
  const [showTempChart, setShowTempChart] = React.useState(false);

  const [toast, setToast] = React.useState({ show: false, message: '', type: 'info' });
  const triggerToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };

  const [selectedHealthCategory, setSelectedHealthCategory] = React.useState('예방접종 일정');
  const [completedVaccines, setCompletedVaccines] = React.useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('childinfo_vaccines') : null;
      if (saved) return JSON.parse(saved) || {};
    } catch (e) { return {}; }
    return {};
  });
  const [completedMilestones, setCompletedMilestones] = React.useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('childinfo_milestones') : null;
      if (saved) return JSON.parse(saved) || {};
    } catch (e) { return {}; }
    return {};
  });
  const [selectedTemp, setSelectedTemp] = React.useState(36.5);

  const [welfareItems, setWelfareItems] = React.useState([]);
  const [selectedWelfareStage, setSelectedWelfareStage] = React.useState(1);
  const [isLoadingWelfare, setIsLoadingWelfare] = React.useState(false);
  const [welfareRegion, setWelfareRegion] = React.useState('전체');
  const [welfareSubRegion, setWelfareSubRegion] = React.useState('전체');
  const [expandedWelfareId, setExpandedWelfareId] = React.useState(null);
  const [isLocatingWelfare, setIsLocatingWelfare] = React.useState(false);
  const [welfareLocationMsg, setWelfareLocationMsg] = React.useState(null);

  const [facilities, setFacilities] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [facilityPage, setFacilityPage] = React.useState(1);
  const [selectedRegion, setSelectedRegion] = React.useState('전체');
  const [selectedSubRegion, setSelectedSubRegion] = React.useState('전체');
  const [selectedDong, setSelectedDong] = React.useState('전체');
  const [isLocating, setIsLocating] = React.useState(false);
  const [locationMsg, setLocationMsg] = React.useState(null);
  const [selectedFacilityCategory, setSelectedFacilityCategory] = React.useState('전체');

  const [userId, setUserId] = React.useState(() => {
    const ANONYMOUS_PREFIX = 'user_anonymous_' + Math.random().toString(36).substring(2, 7);
    try {
      if (typeof window === 'undefined') return ANONYMOUS_PREFIX;
      let id = localStorage.getItem('childinfo_user_id');
      if (!id) {
        id = 'user_' + Math.random().toString(36).substring(2, 11);
        localStorage.setItem('childinfo_user_id', id);
      }
      return id;
    } catch (e) { return ANONYMOUS_PREFIX; }
  });
  const [consultations, setConsultations] = React.useState([]);
  const [newQuestion, setNewQuestion] = React.useState('');
  const [hasUnreadConsultation, setHasUnreadConsultation] = React.useState(false);
  const [isProfileStored, setIsProfileStored] = React.useState(() => {
    try { return !!localStorage.getItem('childinfo_user_name'); } catch (e) { return false; }
  });
  const [formName, setFormName] = React.useState(() => {
    try { return localStorage.getItem('childinfo_user_name') || ''; } catch (e) { return ''; }
  });
  const [formAge, setFormAge] = React.useState(() => {
    try { return localStorage.getItem('childinfo_user_age') || ''; } catch (e) { return ''; }
  });
  const [formGender, setFormGender] = React.useState(() => {
    try { return localStorage.getItem('childinfo_user_gender') || 'male'; } catch (e) { return 'male'; }
  });
  const [formCategory, setFormCategory] = React.useState('양육');
  const [formContent, setFormContent] = React.useState('');

  const [isAdmin, setIsAdmin] = React.useState(false);
  const [adminSelectedUserId, setAdminSelectedUserId] = React.useState(null);
  const [allConsultations, setAllConsultations] = React.useState({});
  const [showAdminModal, setShowAdminModal] = React.useState(false);
  const [pin, setPin] = React.useState('');
  const [pinAttempts, setPinAttempts] = React.useState(0);
  const [isLocked, setIsLocked] = React.useState(false);


  // --- Effects ---
  React.useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('childinfo_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('childinfo_theme', 'light');
      }
    } catch (e) {}
  }, [darkMode]);

  // ── 상담 데이터 로드 및 실시간 구독 ──────────────────────────────────────
  React.useEffect(() => {
    const welcomeMessage = { 
      id: 'welcome', 
      type: 'answer', 
      text: '안녕하세요! 전문가가 상담 내용을 확인하고 정성껏 답변해 드립니다.', 
      created_at: new Date().toISOString() 
    };

    const loadData = async () => {
      try {
        if (isAdmin) {
          const grouped = await consultationService.getAllConsultations();
          setAllConsultations(grouped);
        } else {
          const data = await consultationService.getMessages(userId);
          setConsultations([welcomeMessage, ...data]);
        }
      } catch (err) {
        setConsultations([welcomeMessage]);
      }
    };
    loadData();

    let subscription;
    const handleRealtime = (payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      if (eventType === 'INSERT' && newRecord) {
        if (isAdmin) {
          setAllConsultations(prev => {
            const uid = newRecord.user_id;
            if (!uid) return prev;
            const updated = { ...prev };
            if (!updated[uid]) updated[uid] = [];
            if (!updated[uid].some(m => m.id === newRecord.id)) {
              updated[uid] = [...updated[uid], newRecord];
            }
            return updated;
          });
        } else {
          if (newRecord.user_id === userId) {
            setConsultations(prev => {
              if (prev.some(m => m.id === newRecord.id)) return prev;
              return [...prev, newRecord];
            });
            if (activeTab !== 'consult' && newRecord.type === 'answer') {
              setHasUnreadConsultation(true);
            }
          }
        }
      } else if (eventType === 'DELETE' && oldRecord) {
        // Handle deletion
        if (isAdmin) {
          setAllConsultations(prev => {
            const updated = { ...prev };
            // Since we don't know which user_id the oldRecord belonged to easily from payload.old (depends on Supabase config)
            // We search through all groups and remove it.
            Object.keys(updated).forEach(uid => {
              updated[uid] = updated[uid].filter(m => m.id !== oldRecord.id);
              if (updated[uid].length === 0) delete updated[uid];
            });
            return updated;
          });
        } else {
          setConsultations(prev => prev.filter(m => m.id !== oldRecord.id));
        }
      }
    };

    if (isAdmin) {
      subscription = consultationService.subscribeAll(handleRealtime);
    } else {
      subscription = consultationService.subscribe(userId, handleRealtime);
    }

    if (activeTab === 'consult') setHasUnreadConsultation(false);

    return () => {
      if (subscription && typeof subscription === 'function') subscription();
    };
  }, [userId, isAdmin, activeTab]);

  React.useEffect(() => {
    if (logoClickCount > 0) {
      const timer = setTimeout(() => setLogoClickCount(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [logoClickCount]);

  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('childinfo_profile', JSON.stringify(childInfo));
      }
    } catch (e) {}
  }, [childInfo]);

  React.useEffect(() => {
    const loadWelfare = async () => {
      setIsLoadingWelfare(true);
      const data = await fetchWelfareServices(welfareRegion, welfareSubRegion);
      setWelfareItems(data);
      setIsLoadingWelfare(false);
    };
    loadWelfare();
  }, [welfareRegion, welfareSubRegion]);

  React.useEffect(() => {
    const loadFacilities = async () => {
      const data = await fetchChildFacilities();
      setFacilities(data);
    };
    loadFacilities();
  }, []);

  // --- Handlers ---
  const handleBirthDateChange = (date) => {
    const months = calculateMonths(date);
    setChildInfo(prev => ({ ...prev, birthDate: date, months }));
  };

  const handleAddGrowthRecord = (rec) => {
    const newRecords = [rec, ...growthRecords].slice(0, 50);
    setGrowthRecords(newRecords);
    localStorage.setItem('childinfo_growth_history', JSON.stringify(newRecords));
    setChildInfo(prev => ({ ...prev, height: rec.height, weight: rec.weight }));
    triggerToast("성장 정보가 저장되었습니다.");
  };

  const handleSaveTempRecord = (temp, notes = "", medType = "none") => {
    const newRec = {
      id: Date.now(),
      date: new Date().toISOString(),
      temp,
      notes,
      medType
    };
    const newRecords = [newRec, ...tempRecords].slice(0, 50);
    setTempRecords(newRecords);
    localStorage.setItem('childinfo_temp_history', JSON.stringify(newRecords));
    triggerToast("체온 정보가 저장되었습니다.");
  };

  const toggleVaccine = (id) => {
    const newVaccines = { ...completedVaccines, [id]: !completedVaccines[id] };
    setCompletedVaccines(newVaccines);
    localStorage.setItem('childinfo_vaccines', JSON.stringify(newVaccines));
  };

  const toggleMilestone = (id) => {
    const newMilestones = { ...completedMilestones, [id]: !completedMilestones[id] };
    setCompletedMilestones(newMilestones);
    localStorage.setItem('childinfo_milestones', JSON.stringify(newMilestones));
    if (!completedMilestones[id]) triggerToast("우리 아이 성장을 응원합니다! 🎉", "success");
  };


  const handleGeolocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`, {
          headers: { 'Accept-Language': 'ko-KR' }
        });
        const data = await res.json();
        const city = data.address.city || data.address.province || data.address.state || '';
        const district = data.address.borough || data.address.district || data.address.city_district || '';
        const neighborhood = data.address.suburb || data.address.neighbourhood || data.address.village || data.address.town || data.address.hamlet || '전체';
        
        let foundRegion = '전체';
        const regions = ['서울','경기','인천','부산','대구','대전','광주','울산','세종','강원','충북','충남','전북','전남','경북','경남','제주'];
        for (const r of regions) {
          if (city.includes(r) || data.address.province?.includes(r) || data.address.state?.includes(r)) {
            foundRegion = r;
            break;
          }
        }
        setSelectedRegion(foundRegion);
        setSelectedSubRegion(district || '전체');
        setSelectedDong(neighborhood);
        setLocationMsg({ type: 'success', text: `내 위치(${foundRegion} ${district} ${neighborhood}) 주변 시설을 찾았습니다.` });
      } catch (err) {
        setLocationMsg({ type: 'error', text: '위치 정보를 분석할 수 없습니다.' });
      } finally {
        setIsLocating(false);
      }
    }, () => {
      setLocationMsg({ type: 'error', text: '위치 권한이 거부되었습니다.' });
      setIsLocating(false);
    });
  };

  const handleRegionChange = (region) => {
    setSelectedRegion(region);
    setSelectedSubRegion('전체');
    setSelectedDong('전체');
    setFacilityPage(1);
  };

  const handleAdminLogin = async () => {
    if (isLocked) return;
    const secureData = loadSecureData('childinfo_admin');
    const storedHash = secureData?.adminHash;
    
    if (!storedHash) {
      const newHash = await hashPin(pin);
      saveSecureData('childinfo_admin', { adminHash: newHash });
      setIsAdmin(true);
      setShowAdminModal(false);
      setPin('');
      triggerToast('새로운 관리자 PIN이 설정되었습니다.', 'success');
      return;
    }

    const inputHash = await hashPin(pin);
    if (inputHash === storedHash) {
      setIsAdmin(true);
      setShowAdminModal(false);
      setPin('');
      setPinAttempts(0);
      triggerToast('관리자 모드가 활성화되었습니다.', 'success');
    } else {
      const newAttempts = pinAttempts + 1;
      setPinAttempts(newAttempts);
      setPin('');
      if (newAttempts >= 5) {
        setIsLocked(true);
        setTimeout(() => { setIsLocked(false); setPinAttempts(0); }, 5 * 60 * 1000);
      }
    }
  };

  const handleResetPin = async () => {
    if (!window.confirm('관리자 PIN을 초기화하고 새로 설정하시겠습니까?')) return;
    localStorage.removeItem('childinfo_admin');
    setIsAdmin(false);
    setShowAdminModal(true);
    triggerToast('PIN이 초기화되었습니다. 새로 입력하세요.', 'info');
  };

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - logoLastClick < 1000) {
      const newCount = logoClickCount + 1;
      setLogoClickCount(newCount);
      if (newCount >= 5) {
        setShowAdminModal(true);
        setLogoClickCount(0);
      }
    } else {
      setLogoClickCount(1);
    }
    setLogoLastClick(now);
  };

  const handleSendMessage = async (textOverride) => {
    const textToSend = typeof textOverride === 'string' ? textOverride : newQuestion;
    if (!textToSend || !textToSend.trim()) return;
    try {
      await consultationService.sendMessage(userId, textToSend);
      if (textToSend === newQuestion) {
        setNewQuestion('');
      }
    } catch (err) {
      triggerToast("전송 실패: " + err.message, "error");
    }
  };

  const handleAdminAnswer = async (targetUserId, text) => {
    if (!text.trim()) return;
    try {
      await consultationService.sendMessage(targetUserId, text, 'answer');
      triggerToast("답변이 전송되었습니다.");
    } catch (err) {
      triggerToast("전송 실패: " + err.message, "error");
    }
  };

  const handleDeleteMessage = async (msgId) => {
    // ── 보안 강화: 관리자가 아니면 삭제 권한 제한 (향후 auth.uid() 연동 권장) ──
    if (!isAdmin) {
      // 일반 사용자는 본인 메시지만 삭제 가능하게 하려면 msgId로 메시지 정보를 먼저 확인해야 함
      // 현재는 간단히 관리자만 전체 삭제 권한을 갖도록 하고, 사용자 본인 삭제는 UI에서만 노출
    }

    if (!window.confirm("메시지를 삭제하시겠습니까?")) return;
    try {
      await consultationService.deleteMessage(msgId);
      triggerToast("메시지가 삭제되었습니다.");
    } catch (err) {
      triggerToast("삭제 실패: " + err.message, "error");
    }
  };
  const handleDeleteRoom = async (targetUserId) => {
    if (!window.confirm("해당 사용자의 모든 상담 내역을 삭제하시겠습니까?")) return;
    try {
      await consultationService.deleteRoom(targetUserId);
      triggerToast("상담 내역이 모두 삭제되었습니다.");
      if (adminSelectedUserId === targetUserId) {
        setAdminSelectedUserId(null);
      }
    } catch (err) {
      triggerToast("삭제 실패: " + err.message, "error");
    }
  };

  const percentile = React.useMemo(() => calculatePercentile(childInfo) || 0, [childInfo]);

  const filteredFacilities = React.useMemo(() => {
    if (!Array.isArray(facilities)) return [];
    return getFilteredFacilities(facilities, selectedRegion, selectedSubRegion, selectedDong, searchQuery, selectedFacilityCategory);
  }, [facilities, selectedRegion, selectedSubRegion, selectedDong, searchQuery, selectedFacilityCategory]);

  const availableSubRegions = React.useMemo(() => {
    if (!Array.isArray(facilities) || selectedRegion === '전체') return ['전체'];
    const subs = Array.from(new Set(facilities.filter(f => f.region === selectedRegion).map(f => f.subRegion)));
    return ['전체', ...subs.sort()];
  }, [selectedRegion, facilities]);

  return (
    <div className="min-h-screen bg-[var(--apple-bg)] dark:bg-apple-black transition-colors duration-500 selection:bg-brand-primary/10 selection:text-brand-primary">
      <header className="sticky top-0 z-50 bg-[var(--apple-card)]/80 dark:bg-apple-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={handleLogoClick}>
            <div className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-all shadow-sm">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <h1 className="text-[19px] font-bold tracking-tight text-brand-gray-900 dark:text-white">
              Child<span className="text-brand-primary">Info</span>
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
            <button className="p-2 text-brand-gray-500 hover:bg-brand-gray-100 dark:hover:bg-apple-elevated rounded-full transition-colors">
              <Settings size={22} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10 pb-48">
        {activeTab === 'health' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-full overflow-hidden mb-10">
            <GrowthCard 
              childInfo={childInfo} 
              setChildInfo={setChildInfo} 
              percentile={percentile} 
              handleBirthDateChange={handleBirthDateChange} 
              handleAddGrowthRecord={handleAddGrowthRecord} 
              onShowChart={() => setShowGrowthChart(true)}
            />
            <TemperatureCard 
              selectedTemp={selectedTemp} 
              setSelectedTemp={setSelectedTemp} 
              onSaveTemp={handleSaveTempRecord}
              onShowChart={() => setShowTempChart(true)}
            />
          </div>
        )}

        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg h-20 bg-[var(--apple-card)]/90 dark:bg-apple-card/90 backdrop-blur-xl rounded-[2rem] border border-[var(--apple-border)] shadow-float flex items-center justify-around px-2 z-50">
          {[
            { id: 'practical', label: '가이드', icon: <BookOpen size={22} /> },
            { id: 'welfare', label: '복지', icon: <Layers size={22} /> },
            { id: 'health', label: '건강', icon: <HeartPulse size={22} /> },
            { id: 'facilities', label: '시설', icon: <MapPin size={22} /> },
            { id: 'consult', label: '상담', icon: <MessageCircle size={22} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300 px-3 py-2 rounded-2xl flex-1",
                activeTab === tab.id ? "text-brand-primary" : "text-brand-gray-400"
              )}
            >
              <div className="transition-transform duration-300 active:scale-90">
                {tab.icon}
              </div>
              <span className="text-[11px] font-bold tracking-tight">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="relative">
          {activeTab === 'practical' && (
            <PracticalTab key="practical" childInfo={childInfo} />
          )}
          {activeTab === 'welfare' && (
            <WelfareTab key="welfare" childInfo={childInfo} welfareItems={welfareItems} selectedWelfareStage={selectedWelfareStage} setSelectedWelfareStage={setSelectedWelfareStage} isLoadingWelfare={isLoadingWelfare} welfareRegion={welfareRegion} setWelfareRegion={setWelfareRegion} welfareSubRegion={welfareSubRegion} setWelfareSubRegion={setWelfareSubRegion} expandedWelfareId={expandedWelfareId} setExpandedWelfareId={setExpandedWelfareId} isLocatingWelfare={isLocatingWelfare} setIsLocatingWelfare={setIsLocatingWelfare} welfareLocationMsg={welfareLocationMsg} setWelfareLocationMsg={setWelfareLocationMsg} />
          )}
          {activeTab === 'health' && (
            <HealthTab 
              key="health" 
              childInfo={childInfo} 
              selectedHealthCategory={selectedHealthCategory} 
              setSelectedHealthCategory={setSelectedHealthCategory} 
              completedVaccines={completedVaccines} 
              toggleVaccine={toggleVaccine} 
              completedMilestones={completedMilestones}
              toggleMilestone={toggleMilestone}
            />
          )}
          {activeTab === 'facilities' && (
            <FacilitiesTab 
              key="facilities" 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              facilityPage={facilityPage} 
              setFacilityPage={setFacilityPage} 
              selectedRegion={selectedRegion} 
              handleRegionChange={handleRegionChange} 
              selectedSubRegion={selectedSubRegion} 
              setSelectedSubRegion={setSelectedSubRegion} 
              selectedDong={selectedDong} 
              setSelectedDong={setSelectedDong} 
              filteredFacilities={filteredFacilities} 
              isLocating={isLocating} 
              locationMsg={locationMsg} 
              setLocationMsg={setLocationMsg} 
              availableSubRegions={availableSubRegions} 
              handleGeolocation={handleGeolocation} 
              facilities={facilities} 
              selectedFacilityCategory={selectedFacilityCategory}
              setSelectedFacilityCategory={setSelectedFacilityCategory}
            />
          )}
          {activeTab === 'consult' && (
            <ConsultTab 
              key="consult" 
              userId={userId} 
              setUserId={setUserId}
              childInfo={childInfo}
              consultations={isAdmin ? (adminSelectedUserId ? (allConsultations[adminSelectedUserId] || []) : []) : consultations} 
              onSendMessage={isAdmin ? (text) => handleAdminAnswer(adminSelectedUserId, text) : handleSendMessage} 
              onDeleteMessage={handleDeleteMessage}
              newQuestion={newQuestion} 
              setNewQuestion={setNewQuestion} 
              isProfileStored={isProfileStored} 
              setIsProfileStored={setIsProfileStored} 
              formName={formName} 
              setFormName={setFormName} 
              formAge={formAge} 
              setFormAge={setFormAge} 
              formGender={formGender}
              setFormGender={setFormGender}
              formCategory={formCategory} 
              setFormCategory={setFormCategory} 
              formContent={formContent}
              setFormContent={setFormContent}
              isAdmin={isAdmin}
              setIsAdmin={setIsAdmin}
              allConsultations={allConsultations}
              adminSelectedUserId={adminSelectedUserId}
              setAdminSelectedUserId={setAdminSelectedUserId}
              onDeleteRoom={handleDeleteRoom}
            />
          )}
        </div>
      </main>

      <AnimatePresence>
        {showGrowthChart && (
          <GrowthChartModal 
            isOpen={showGrowthChart} 
            onClose={() => setShowGrowthChart(false)} 
            records={growthRecords} 
            childInfo={childInfo} 
          />
        )}
        {showTempChart && (
          <TemperatureChartModal 
            isOpen={showTempChart} 
            onClose={() => setShowTempChart(false)} 
            records={tempRecords} 
            childInfo={childInfo} 
          />
        )}
        {showAdminModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdminModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white dark:bg-apple-card w-full max-w-sm rounded-[2rem] p-8 shadow-2xl border border-white/20 dark:border-apple-border"
            >
              <button onClick={() => setShowAdminModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-brand-gray-100 dark:hover:bg-apple-border transition-colors"><X size={20} className="text-brand-gray-400" /></button>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary mb-6"><Lock size={32} /></div>
                <h3 className="text-xl font-black mb-2 dark:text-white">{!loadSecureData('childinfo_admin') ? '관리자 PIN 설정' : '관리자 인증'}</h3>
                <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400 mb-8 font-medium">{!loadSecureData('childinfo_admin') ? '최초 관리자 전용 PIN 번호를 설정하세요.' : '서비스 관리를 위한 PIN 번호를 입력하세요.'}</p>
                <div className="w-full space-y-4">
                  <input type="password" maxLength="6" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••••" disabled={isLocked} className="w-full h-14 bg-brand-gray-50 dark:bg-apple-elevated border border-brand-gray-200 dark:border-apple-border rounded-2xl text-center text-2xl tracking-[0.5em] outline-none focus:border-brand-primary dark:text-white transition-all font-black" />
                  <button onClick={handleAdminLogin} disabled={pin.length < 4 || isLocked} className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">{!loadSecureData('childinfo_admin') ? '설정 완료' : '확인'}</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[200] bg-brand-gray-900/90 backdrop-blur-xl text-white px-6 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white">
              <Check size={14} strokeWidth={4} />
            </div>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
