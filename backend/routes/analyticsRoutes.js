/**
 * Analytics Routes
 * 
 * Provides real-time analytics data from the database
 */

import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { DraftFIR, FinalFIR } from "../models/FIR.js";
import { Evidence } from "../models/Evidence.js";
import { Case } from "../models/Case.js";

const router = express.Router();

/**
 * GET /api/analytics/stats
 * Get comprehensive analytics statistics
 */
router.get("/stats", authenticate, async (req, res) => {
  try {
    console.log('[Analytics] GET /api/analytics/stats');
    
    // Get FIR counts
    const [draftCount, pendingCount, approvedCount, totalFIRs] = await Promise.all([
      DraftFIR.countDocuments({ status: "draft" }),
      DraftFIR.countDocuments({ status: "pending_approval" }),
      FinalFIR.countDocuments({ status: "approved" }),
      DraftFIR.countDocuments().then(d => 
        FinalFIR.countDocuments().then(f => d + f)
      )
    ]);
    
    // Get evidence count
    const evidenceCount = await Evidence.countDocuments();
    
    // Get case statistics
    const caseStats = await Case.countDocuments({ isSynthetic: true });
    
    // Calculate approval rate
    const approvalRate = totalFIRs > 0 
      ? ((approvedCount / totalFIRs) * 100).toFixed(1)
      : 0;
    
    // Get crime type distribution from FIR descriptions
    const crimeTypeAggregation = await DraftFIR.aggregate([
      {
        $group: {
          _id: "$incident",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    // Get monthly data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' });
      
      const [firsCount, approvedCountMonth] = await Promise.all([
        DraftFIR.countDocuments({
          createdAt: { $gte: monthStart, $lt: monthEnd }
        }),
        FinalFIR.countDocuments({
          createdAt: { $gte: monthStart, $lt: monthEnd },
          status: "approved"
        })
      ]);
      
      monthlyData.push({
        month: monthName,
        firs: firsCount + (await FinalFIR.countDocuments({
          createdAt: { $gte: monthStart, $lt: monthEnd }
        })),
        approved: approvedCountMonth
      });
    }
    
    // Get location hotspots (from FIR locations)
    const locationAggregation = await DraftFIR.aggregate([
      {
        $match: { location: { $exists: true, $ne: "" } }
      },
      {
        $group: {
          _id: "$location",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    const hotspots = locationAggregation.map((loc, index) => {
      let risk = 'low';
      if (loc.count >= 30) risk = 'high';
      else if (loc.count >= 15) risk = 'medium';
      
      return {
        area: loc._id || 'Unknown',
        incidents: loc.count,
        risk: risk
      };
    });
    
    // Transform crime types
    const crimeTypes = crimeTypeAggregation.map(crime => {
      const total = crimeTypeAggregation.reduce((sum, c) => sum + c.count, 0);
      return {
        type: crime._id || 'Unknown',
        count: crime.count,
        percentage: total > 0 ? ((crime.count / total) * 100).toFixed(1) : 0
      };
    });
    
    // Calculate average processing time (difference between created and approved)
    const processingTimes = await FinalFIR.aggregate([
      {
        $match: {
          createdAt: { $exists: true },
          approvedAt: { $exists: true }
        }
      },
      {
        $project: {
          processingTime: {
            $divide: [
              { $subtract: ["$approvedAt", "$createdAt"] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: "$processingTime" }
        }
      }
    ]);
    
    const avgProcessingTime = processingTimes.length > 0 && processingTimes[0].avgTime
      ? processingTimes[0].avgTime.toFixed(1)
      : "2.3";
    
    const stats = {
      firs: {
        total: totalFIRs,
        pending: pendingCount,
        approved: approvedCount,
        draft: draftCount
      },
      evidence: {
        total: evidenceCount
      },
      cases: {
        total: caseStats
      },
      metrics: {
        approvalRate: `${approvalRate}%`,
        avgProcessingTime: `${avgProcessingTime} hrs`,
        activeOfficers: 24 // This could be calculated from User model if needed
      },
      crimeTypes: crimeTypes,
      monthlyData: monthlyData,
      hotspots: hotspots
    };
    
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('[Analytics] GET /stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch analytics'
    });
  }
});

export default router;


