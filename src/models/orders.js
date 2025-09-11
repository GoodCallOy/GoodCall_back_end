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
const OrderSchema = new mongoose_1.Schema({
    caseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Case',
        required: true
    },
    caseName: {
        type: String, // <- add this
        required: true
    },
    caseUnit: {
        type: String,
        enum: ['hours', 'interviews', 'meetings'],
        required: true
    },
    pricePerUnit: {
        type: Number,
        required: true
    },
    totalQuantity: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'cancelled', 'on-hold'],
        required: true
    },
    estimatedRevenue: {
        type: Number,
        required: true
    },
    agentGoals: {
        type: Object, // or Map, or Mixed, depending on your needs
        default: {}
    },
    assignedCallers: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'gcAgent',
        }
    ],
    manager: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    agentsPrice: {
        type: Map,
        of: Number,
        default: {}
    }
}, { timestamps: true });
exports.default = mongoose_1.default.model('Order', OrderSchema);
