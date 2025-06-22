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
const DailyLogSchema = new mongoose_1.Schema({
    agent: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'gcAgent',
        required: true
    },
    agentName: {
        type: String,
        required: true
    },
    order: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    caseName: {
        type: String,
        required: true
    },
    caseUnit: {
        type: String,
        enum: ['hours', 'interviews', 'meetings'],
        required: true
    },
    call_time: {
        type: Number,
        required: true
    },
    completed_calls: {
        type: Number,
        required: true
    },
    outgoing_calls: {
        type: Number,
        required: true
    },
    answered_calls: {
        type: Number,
        required: true
    },
    response_rate: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    quantityCompleted: {
        type: Number,
        required: true
    }
}, { timestamps: true });
exports.default = mongoose_1.default.model('DailyLog', DailyLogSchema);
