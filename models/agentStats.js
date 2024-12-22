"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const agentStatsSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    meetings: {
        type: Number,
        required: false,
    },
    call_time: {
        type: Number,
        required: true,
    },
    calls_made: {
        type: Number,
        required: true,
    },
    outgoing_calls: {
        type: Number,
        required: true,
    },
    answered_calls: {
        type: Number,
        required: false,
    },
    response_rate: {
        type: Number,
        required: false,
    },
    case: {
        type: String,
        required: false,
    },
    create_date: {
        type: Date,
        default: Date.now,
    },
});
const AgentStats = mongoose_1.default.model('AgentStats', agentStatsSchema);
exports.default = AgentStats;
