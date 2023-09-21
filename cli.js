#!/usr/bin/env node
import {AiBackendCompanion} from "./index.js";



new AiBackendCompanion().start(process.env.port ?? 8055)
