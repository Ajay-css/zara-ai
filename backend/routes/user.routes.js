import { Router } from 'express'
import { getUserProfile, updateUserProfile, updatePreferences } from '../controllers/user.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = Router()

// Apply protection middleware to all routes
router.use(protect)

router.get('/profile', getUserProfile)
router.put('/profile', updateUserProfile)
router.put('/preferences', updatePreferences)

export default router