import { FUND_OPTIONS } from './funds.js';
import { DIFFICULTY_OPTIONS, STARTUP_LOAN_OPTIONS } from './difficulty.js';
import { STARTING_VEHICLE_OPTIONS } from './startingVehicles.js';
import { CROPS } from './crops.js';
import { TASKS, MONTH_TASK_TEXT, MONTH_LABOR_LOAD } from './tasks.js';
import { LAND_GROUPS, LAND_REGION } from './land.js';

export { SAVE_SLOTS, START_DATE } from './meta.js';
export { FUND_OPTIONS } from './funds.js';
export { DIFFICULTY_OPTIONS, STARTUP_LOAN_OPTIONS } from './difficulty.js';
export { STARTING_VEHICLE_OPTIONS } from './startingVehicles.js';
export { CROPS } from './crops.js';
export { TASKS, MONTH_TASK_TEXT, MONTH_LABOR_LOAD } from './tasks.js';
export {
  LAND_GROUPS,
  LAND_REGION,
  SLOPE_LABOR_MULTIPLIER_TABLE,
  createLandPool,
  slopeBandLabelByDeg,
  slopeJudgeLabelByDeg,
  slopeLaborMultiplierByDeg
} from './land.js';

export const GAME_DATA = {
  funds: FUND_OPTIONS,
  difficulties: DIFFICULTY_OPTIONS,
  startupLoans: STARTUP_LOAN_OPTIONS,
  startingVehicles: STARTING_VEHICLE_OPTIONS,
  landGroups: LAND_GROUPS,
  region: LAND_REGION,
  crops: CROPS,
  tasks: TASKS,
  monthTaskText: MONTH_TASK_TEXT,
  monthLaborLoad: MONTH_LABOR_LOAD
};
