
// Manual high-quality data (modular)
import { jongnoData } from './jongno';
import { jungguData } from './junggu';
import { yongsanData } from './yongsan';
import { seongdongData } from './seongdong';
import { gwangjinData } from './gwangjin';
import { dongdaemunData } from './dongdaemun';
import { jungnangData } from './jungnang';
import { seongbukData } from './seongbuk';
import { gangbukData } from './gangbuk';
import { dobongData } from './dobong';
import { nowonData } from './nowon';
import { eunpyeongData } from './eunpyeong';
import { seodaemunData } from './seodaemun';
import { mapoData } from './mapo';
import { yangcheonData } from './yangcheon';
import { gangseoData } from './gangseo';
import { guroData } from './guro';
import { geumcheonData } from './geumcheon';
import { yeongdeungpoData } from './yeongdeungpo';
import { dongjakData } from './dongjak';
import { gwanakData } from './gwanak';
import { seochoData } from './seocho';
import { gangnamData } from './gangnam';
import { songpaData } from './songpa';
import { gangdongData } from './gangdong';

// Automated high-density data
import { seoulAutoData } from './auto_index';

// Legacy curated data
import { seoulInfra as legacySeoulInfra } from '../seoul_infra';

export const seoulInfra = [
  ...legacySeoulInfra,
  ...jongnoData,
  ...jungguData,
  ...yongsanData,
  ...seongdongData,
  ...gwangjinData,
  ...dongdaemunData,
  ...jungnangData,
  ...seongbukData,
  ...gangbukData,
  ...dobongData,
  ...nowonData,
  ...eunpyeongData,
  ...seodaemunData,
  ...mapoData,
  ...yangcheonData,
  ...gangseoData,
  ...guroData,
  ...geumcheonData,
  ...yeongdeungpoData,
  ...dongjakData,
  ...gwanakData,
  ...seochoData,
  ...gangnamData,
  ...songpaData,
  ...gangdongData,
  ...seoulAutoData
];
