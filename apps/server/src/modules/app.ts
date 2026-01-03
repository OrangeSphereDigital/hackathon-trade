import { adminController } from "./admin/admin.controller";
import { arbitrageController } from "./arbitrage/arbitrage.controller";
import { arbitrageAdminController } from "./arbitrage/arbitrage.admin.controller";
import { contactController } from "./contact/contact.controller";
import { spreadHistoryController } from "./spread-history/spread-history.controller";
import { simulationController } from "./simulation/simulation.controller";
import { usersController } from "./users/users.controller";
import Elysia from "elysia";


export const app = new Elysia()
    .use(adminController)
    .use(arbitrageController)
    .use(arbitrageAdminController)
    .use(simulationController)
    .use(contactController)
    .use(spreadHistoryController)
    .use(usersController)