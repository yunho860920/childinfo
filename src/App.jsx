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
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
import { fetchChildFacilities, getFilteredFacilities } from './services/facilityService';
import { loadSecureData, saveSecureData } from './utils/security';
import { hashPin, calculateMonths, calculatePercentile } from './utils/growthUtils';
import { FACILITIES_PER_PAGE, ALL_REGIONS } from './constants/uiConstants';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

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
      name: '우리 아이',
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
      if (saved) return JSON.parse(saved);
    } catch (e) { return []; }
    return [];
  });
  const [showGrowthChart, setShowGrowthChart] = React.useState(false);

  const [tempRecords, setTempRecords] = React.useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('childinfo_temp_history') : null;
      if (saved) return JSON.parse(saved);
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
      if (saved) return JSON.parse(saved);
    } catch (e) { return {}; }
    return {};
  });
  const [completedMilestones, setCompletedMilestones] = React.useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('childinfo_milestones') : null;
      if (saved) return JSON.parse(saved);
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

  const [userId] = React.useState(() => {
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
  const [consultations, setConsultations] = React.useState([{
    id: 'welcome',
    type: 'answer',
    text: '반갑습니다! 무엇을 도와드릴까요? 전문가가 곧 답변해 드립니다.',
    created_at: new Date().toISOString()
  }]);
  const [newQuestion, setNewQuestion] = React.useState('');
  const [isProfileStored, setIsProfileStored] = React.useState(() => {
    try { return !!localStorage.getItem('childinfo_user_name'); } catch (e) { return false; }
  });
  const [formName, setFormName] = React.useState('');
  const [formAge, setFormAge] = React.useState('');
  const [formCategory, setFormCategory] = React.useState('양육');

  const [selectedMilestone, setSelectedMilestone] = React.useState(null);
  const [selectedCategory, setSelectedCategory] = React.useState('전체');
  const [selectedTimelineMonth, setSelectedTimelineMonth] = React.useState(0);

  const [isAdmin, setIsAdmin] = React.useState(false);
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
  React.useEffect(() => {
    if (logoClickCount > 0) {
      const timer = setTimeout(() => setLogoClickCount(0), 2000);
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

  const percentile = React.useMemo(() => calculatePercentile(childInfo) || 0, [childInfo]);

  const filteredFacilities = React.useMemo(() => {
    if (!Array.isArray(facilities)) return [];
    return getFilteredFacilities(facilities, selectedRegion, selectedSubRegion, selectedDong, searchQuery);
  }, [facilities, selectedRegion, selectedSubRegion, selectedDong, searchQuery]);

  const availableSubRegions = React.useMemo(() => {
    if (!Array.isArray(facilities) || selectedRegion === '전체') return ['전체'];
    const subs = Array.from(new Set(facilities.filter(f => f.region === selectedRegion).map(f => f.subRegion)));
    return ['전체', ...subs.sort()];
  }, [selectedRegion, facilities]);

  return (
    <div className="min-h-screen bg-brand-gray-50 dark:bg-apple-black transition-colors duration-500 selection:bg-brand-primary selection:text-white">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-apple-black/80 backdrop-blur-xl border-b border-brand-gray-100 dark:border-apple-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={handleLogoClick}>
            <div className="w-12 h-12 bg-white border border-brand-gray-100 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-all shadow-sm">
              <ShieldCheck className="text-[#FF4B4B]" size={26} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-brand-gray-900 dark:text-white flex items-center">
                Child<span className="text-[#FF4B4B]">Info</span>
              </h1>
              <p className="text-[10px] font-bold text-brand-gray-400 dark:text-brand-gray-500 uppercase tracking-widest leading-none mt-1">Growth & Safety</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className="p-3 text-brand-gray-400 hover:text-brand-gray-600 transition-colors">
              <Moon size={24} />
            </button>
            <button className="p-3 bg-brand-gray-50 dark:bg-white/5 text-brand-gray-400 rounded-full hover:text-brand-gray-600 transition-colors">
              <Settings size={24} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10 pb-48">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
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

        <nav className="fixed bottom-8 left-4 right-4 h-24 bg-white/95 dark:bg-apple-card/95 backdrop-blur-xl rounded-[2.5rem] border border-[var(--apple-border)] shadow-2xl flex items-center justify-around px-4 z-50 animate-in slide-in-from-bottom-10 duration-700">
          {[
            { id: 'practical', label: '양육 가이드', icon: <BookOpen size={24} /> },
            { id: 'welfare', label: '복지 혜택', icon: <Layers size={24} /> },
            { id: 'health', label: '건강 정보', icon: <HeartPulse size={24} /> },
            { id: 'facilities', label: '시설 검색', icon: <MapPin size={24} /> },
            { id: 'consult', label: '전문가 상담', icon: <MessageCircle size={24} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all duration-500 px-4 py-2 rounded-3xl",
                activeTab === tab.id ? "text-brand-primary bg-brand-primary/[0.03] ring-1 ring-brand-primary/10" : "text-brand-gray-400"
              )}
            >
              <div className="transition-transform duration-500 active:scale-90">
                {tab.icon}
              </div>
              <span className="text-[10px] font-black tracking-tight">{tab.label}</span>
            </button>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          {activeTab === 'practical' && (
            <PracticalTab key="practical" childInfo={childInfo} ageTimelineData={[]} setSelectedMilestone={setSelectedMilestone} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} selectedTimelineMonth={selectedTimelineMonth} setSelectedTimelineMonth={setSelectedTimelineMonth} />
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
            <FacilitiesTab key="facilities" searchQuery={searchQuery} setSearchQuery={setSearchQuery} facilityPage={facilityPage} setFacilityPage={setFacilityPage} selectedRegion={selectedRegion} handleRegionChange={handleRegionChange} selectedSubRegion={selectedSubRegion} setSelectedSubRegion={setSelectedSubRegion} selectedDong={selectedDong} setSelectedDong={setSelectedDong} filteredFacilities={filteredFacilities} isLocating={isLocating} locationMsg={locationMsg} setLocationMsg={setLocationMsg} availableSubRegions={availableSubRegions} handleGeolocation={handleGeolocation} facilities={facilities} />
          )}
          {activeTab === 'consult' && (
            <ConsultTab key="consult" userId={userId} consultations={consultations} setConsultations={setConsultations} newQuestion={newQuestion} setNewQuestion={setNewQuestion} isProfileStored={isProfileStored} setIsProfileStored={setIsProfileStored} formName={formName} setFormName={setFormName} formAge={formAge} setFormAge={setFormAge} formCategory={formCategory} setFormCategory={setFormCategory} isAdmin={isAdmin} />
          )}
        </AnimatePresence>
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdminModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white dark:bg-apple-card w-full max-w-sm rounded-[2rem] p-8 shadow-2xl border border-white/20 dark:border-apple-border">
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
