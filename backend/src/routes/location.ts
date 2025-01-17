import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Validation schema for location
const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});

/**
 * @swagger
 * /api/v1/location/qr:
 *   get:
 *     summary: Get virtual QR code for a location
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Virtual QR code data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 qrCode:
 *                   type: string
 *                 location:
 *                   type: object
 *                   properties:
 *                     latitude:
 *                       type: number
 *                     longitude:
 *                       type: number
 *                     municipality:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 */
router.get('/qr', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude } = locationSchema.parse({
      latitude: Number(req.query.latitude),
      longitude: Number(req.query.longitude)
    });

    // Find municipality for the given coordinates using PostGIS
    const municipality = await prisma.$queryRaw`
      SELECT id, name
      FROM "Municipality"
      WHERE ST_Contains(
        boundaries::geometry,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
      )
      LIMIT 1
    `;

    if (!municipality[0]) {
      return res.status(404).json({ error: 'No municipality found for this location' });
    }

    // Generate a unique QR code based on location and timestamp
    const qrCode = Buffer.from(JSON.stringify({
      lat: latitude,
      lng: longitude,
      ts: Date.now(),
      mid: municipality[0].id
    })).toString('base64');

    res.json({
      qrCode,
      location: {
        latitude,
        longitude,
        municipality: municipality[0]
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Get QR code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v1/location/validate:
 *   get:
 *     summary: Validate if a location is within any municipality boundaries
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Location validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 municipality:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 */
router.get('/validate', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude } = locationSchema.parse({
      latitude: Number(req.query.latitude),
      longitude: Number(req.query.longitude)
    });

    // Check if the location is within any municipality boundaries
    const municipality = await prisma.$queryRaw`
      SELECT id, name
      FROM "Municipality"
      WHERE ST_Contains(
        boundaries::geometry,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
      )
      LIMIT 1
    `;

    res.json({
      valid: municipality.length > 0,
      municipality: municipality[0] || null
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Validate location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 