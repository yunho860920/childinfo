import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  MapPin,
  MessageCircle,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { askAiGuide, getDailyAiQuota } from '../../services/aiGuideService';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  text: '안녕하세요! 홈페이지의 건강·성장·복지·시설·가볼 곳을 직접 찾아드리고, 필요한 경우 일반 참고 정보도 보완해드릴게요.'
};

const QUICK_QUESTIONS = [
  '아이가 열이 40도예요',
  '오늘 아이와 어디에 놀러갈까요?',
  '6개월 예방접종을 알려줘',
  '근처 소아과를 찾아줘',
  '3개월 아기 수유량을 알려줘'
];

const NEEDS_FACILITY_DATA = /(소아과|소아청소년과|병원|의원|응급실|상담|심리|발달센터|수유실|유아휴게소|어린이집|육아종합지원센터|가족센터|돌봄센터|시설|가볼\s*곳|가볼\s*만한\s*곳|갈\s*만한|놀러|나들이|체험)/;

const createMessageId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const AiGuideTab = ({
  childInfo,
  facilities = [],
  places = {},
  welfareItems = [],
  completedVaccines = {},
  growthRecords = [],
  tempRecords = [],
  feedingRecords = [],
  ensureFacilities,
  onNavigate
}) => {
  const [messages, setMessages] = React.useState([WELCOME_MESSAGE]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [pendingIntent, setPendingIntent] = React.useState(null);
  const [remainingAiQuestions, setRemainingAiQuestions] = React.useState(() => getDailyAiQuota().remaining);
  const chatEndRef = React.useRef(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const appendAssistantResult = React.useCallback((result) => {
    setPendingIntent(result.pendingIntent || null);
    if (Number.isFinite(Number(result.remainingAiQuestions))) {
      setRemainingAiQuestions(Number(result.remainingAiQuestions));
    }
    setMessages((current) => [
      ...current,
      {
        id: createMessageId('assistant'),
        role: 'assistant',
        text: result.answer,
        actions: result.actions || [],
        items: result.items || [],
        sources: result.sources || [],
        isSafety: !!result.safety,
        usesGeneralKnowledge: !!result.usesGeneralKnowledge,
        isHomepageResult: result.mode === 'homepage'
      }
    ]);
  }, []);

  const sendMessage = async (rawMessage, options = {}) => {
    const text = String(rawMessage ?? input).trim();
    if (!text || isLoading) return;

    const userMessage = options.hideUserMessage ? null : {
      id: createMessageId('user'),
      role: 'user',
      text
    };
    const history = messages
      .filter((message) => message.id !== 'welcome' && !message.isError)
      .map(({ role, text: messageText }) => ({ role, text: messageText }));

    if (userMessage) setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const resolvedFacilities = facilities.length === 0 && NEEDS_FACILITY_DATA.test(text) && ensureFacilities
        ? await ensureFacilities()
        : facilities;
      const result = await askAiGuide({
        message: text,
        history,
        pendingIntent: options.pendingIntent || pendingIntent,
        childInfo,
        facilities: resolvedFacilities,
        places,
        welfareItems,
        completedVaccines,
        growthRecords,
        tempRecords,
        feedingRecords,
        location: options.location
      });

      appendAssistantResult(result);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: createMessageId('error'),
          role: 'assistant',
          text: error.message || 'AI 안내에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.',
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationAction = (action) => {
    if (!navigator.geolocation) {
      setMessages((current) => [...current, {
        id: createMessageId('location-error'),
        role: 'assistant',
        text: '이 기기에서는 위치 기능을 사용할 수 없어요. 서울·경기·인천·부산 중 지역을 직접 선택해 주세요.',
        isError: true
      }]);
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLoading(false);
        sendMessage('현재 위치에서 찾아줘', {
          hideUserMessage: true,
          pendingIntent: action.intent || pendingIntent,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        });
      },
      () => {
        setIsLoading(false);
        setMessages((current) => [...current, {
          id: createMessageId('location-error'),
          role: 'assistant',
          text: '위치 권한을 확인하지 못했어요. 지역 버튼을 선택하거나 “서울 강남구”처럼 직접 입력해 주세요.',
          isError: true
        }]);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleAction = (action) => {
    if (action?.type === 'reply') {
      sendMessage(action.message, { pendingIntent: action.intent || pendingIntent });
      return;
    }
    if (action?.type === 'location') {
      handleLocationAction(action);
      return;
    }
    onNavigate?.(action);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input);
    }
  };

  const resetChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput('');
    setPendingIntent(null);
    setRemainingAiQuestions(getDailyAiQuota().remaining);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl pb-20"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-primary/5 px-3 py-1.5 text-[11px] font-black text-brand-primary">
            <Sparkles size={13} /> Gemini 3.5 Flash-Lite
          </div>
          <h3 className="text-2xl font-black tracking-tight text-brand-gray-900 dark:text-white">AI 정보 도우미</h3>
          <p className="mt-1 text-[13px] font-medium text-brand-gray-500 dark:text-brand-gray-400">
            홈페이지 기능은 무제한으로 찾고, 부족한 내용은 이 기기에서 하루 3회 AI가 보완합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={resetChat}
          disabled={isLoading || messages.length === 1}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-gray-200 bg-white px-4 py-2.5 text-xs font-black text-brand-gray-500 transition-all hover:border-brand-primary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40 dark:border-apple-border dark:bg-apple-card dark:text-brand-gray-300"
        >
          <RotateCcw size={14} /> 대화 지우기
        </button>
      </div>

      <div className="overflow-hidden rounded-[2.5rem] border border-brand-gray-100 bg-white shadow-xl dark:border-apple-border dark:bg-apple-card">
        <div className="flex items-center justify-between border-b border-brand-gray-100 px-5 py-4 dark:border-apple-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
              <Bot size={21} />
            </div>
            <div>
              <p className="text-sm font-black text-brand-gray-900 dark:text-white">ChildInfo AI 안내</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 홈페이지 기능 우선 연결
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-brand-primary/10 px-2.5 py-1 text-[10px] font-black text-brand-primary">
              AI 상세답변 {remainingAiQuestions}/3
            </span>
            <ShieldCheck size={20} className="text-brand-primary" aria-label="안전 안내 적용" />
          </div>
        </div>

        <div className="h-[510px] space-y-4 overflow-y-auto bg-brand-gray-50/40 p-5 dark:bg-apple-black/30 sm:p-7">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[88%] sm:max-w-[76%] ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                  <div
                    className={`whitespace-pre-wrap rounded-3xl px-5 py-4 text-[13px] font-semibold leading-relaxed shadow-sm ${
                      message.role === 'user'
                        ? 'rounded-br-lg bg-brand-primary text-white'
                        : message.isError
                          ? 'rounded-bl-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300'
                          : message.isSafety
                            ? 'rounded-bl-lg border border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-100'
                            : 'rounded-bl-lg border border-brand-gray-100 bg-white text-brand-gray-700 dark:border-apple-border dark:bg-apple-elevated dark:text-brand-gray-200'
                    }`}
                  >
                    {message.isSafety && (
                      <span className="mb-2 flex items-center gap-1.5 text-[11px] font-black text-orange-600 dark:text-orange-300">
                        <AlertTriangle size={14} /> 우선 확인이 필요한 상황
                      </span>
                    )}
                    {message.text}
                  </div>

                  {!!message.items?.length && (
                    <div className="grid w-full gap-2">
                      {message.items.map((item, index) => (
                        <div
                          key={`${message.id}-item-${index}`}
                          className="rounded-2xl border border-brand-gray-100 bg-white p-4 shadow-sm dark:border-apple-border dark:bg-apple-elevated"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-black text-brand-gray-900 dark:text-white">{item.title}</p>
                              {item.subtitle && <p className="mt-1 text-[10px] font-black text-brand-primary">{item.subtitle}</p>}
                            </div>
                            {item.action && (
                              <button
                                type="button"
                                onClick={() => handleAction(item.action)}
                                className="shrink-0 rounded-xl bg-brand-primary/10 px-2.5 py-1.5 text-[10px] font-black text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
                              >
                                보기 <ArrowRight size={10} className="ml-0.5 inline" />
                              </button>
                            )}
                          </div>
                          {item.detail && <p className="mt-2 text-[11px] font-semibold leading-relaxed text-brand-gray-600 dark:text-brand-gray-300">{item.detail}</p>}
                          {item.meta && <p className="mt-2 text-[9px] font-bold text-brand-gray-400">{item.meta}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {!!message.actions?.length && (
                    <div className="flex flex-wrap gap-2">
                      {message.actions.map((action, index) => (
                        <button
                          type="button"
                          key={`${message.id}-action-${index}`}
                          onClick={() => handleAction(action)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-brand-primary/20 bg-brand-primary/5 px-3 py-2 text-[11px] font-black text-brand-primary transition-all hover:bg-brand-primary hover:text-white"
                        >
                          {action.type === 'location' || action.tab === 'facilities' ? <MapPin size={13} /> : <MessageCircle size={13} />}
                          {action.label}
                          <ArrowRight size={12} />
                        </button>
                      ))}
                    </div>
                  )}

                  {!!message.sources?.length && (
                    <p className="px-1 text-[9px] font-bold text-brand-gray-400">
                      참고: {message.sources.join(' · ')}
                    </p>
                  )}
                  {message.usesGeneralKnowledge && (
                    <p className="rounded-lg bg-amber-50 px-2 py-1 text-[9px] font-black text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                      홈페이지 외 일반 참고정보 · 실시간 검색 결과 아님
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-3xl rounded-bl-lg border border-brand-gray-100 bg-white px-5 py-4 dark:border-apple-border dark:bg-apple-elevated">
                <span className="h-2 w-2 animate-bounce rounded-full bg-brand-primary [animation-delay:-0.2s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-brand-primary [animation-delay:-0.1s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-brand-primary" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {messages.length === 1 && (
          <div className="flex gap-2 overflow-x-auto border-t border-brand-gray-100 px-5 py-3 no-scrollbar dark:border-apple-border">
            {QUICK_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => sendMessage(question)}
                className="whitespace-nowrap rounded-full border border-brand-gray-200 bg-white px-3 py-2 text-[10px] font-black text-brand-gray-500 transition-colors hover:border-brand-primary hover:text-brand-primary dark:border-apple-border dark:bg-apple-elevated dark:text-brand-gray-300"
              >
                {question}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="border-t border-brand-gray-100 p-4 dark:border-apple-border sm:p-5">
          <div className="flex items-end gap-3 rounded-[1.5rem] border-2 border-brand-gray-100 bg-brand-gray-50 p-2 transition-colors focus-within:border-brand-primary dark:border-apple-border dark:bg-apple-elevated">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value.slice(0, 600))}
              onKeyDown={handleKeyDown}
              rows={1}
              maxLength={600}
              disabled={isLoading}
              placeholder="예: 아이가 열이 나는데 관련 정보를 알려줘"
              aria-label="AI 안내 질문"
              className="max-h-28 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-3 text-[13px] font-bold text-brand-gray-900 outline-none placeholder:text-brand-gray-400 disabled:opacity-60 dark:text-white"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20 transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="질문 보내기"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="mt-3 flex items-start gap-1.5 px-1 text-[9px] font-bold leading-relaxed text-brand-gray-400">
            <ShieldCheck size={12} className="mt-0.5 shrink-0" />
            홈페이지 내부 검색은 기기에서 우선 처리합니다. 추가 AI 질문은 Gemini API로 전송되므로 이름·연락처·상세주소 등 개인정보는 입력하지 마세요. 의료진의 진단을 대신하지 않습니다.
          </p>
        </form>
      </div>
    </motion.section>
  );
};

export default AiGuideTab;
