// The Recharts UMD bundle marks itself as an ES module but does not expose a
// default export. A default import therefore becomes `undefined` in the AIT
// esbuild bundle and crashes during startup when these properties are read.
import * as Recharts from '../../node_modules/recharts/umd/Recharts.js';

export const {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} = Recharts;
