import { DEFAULT_BATCH_SIZE } from '../utils/constants.js'

/**
 * Batch processor — slices video arrays into manageable batches
 */
export class BatchProcessor {
    constructor(videos, batchSize = DEFAULT_BATCH_SIZE) {
        this.videos = videos
        this.batchSize = batchSize
        this.currentBatchIndex = 0
        this.totalBatches = Math.ceil(videos.length / batchSize)
    }

    /**
     * Get the current batch of videos
     */
    getCurrentBatch() {
        const start = this.currentBatchIndex * this.batchSize
        const end = start + this.batchSize
        return {
            batchNumber: this.currentBatchIndex + 1,
            totalBatches: this.totalBatches,
            startIndex: start,
            endIndex: Math.min(end, this.videos.length),
            videos: this.videos.slice(start, end),
            hasNext: end < this.videos.length,
            hasPrev: this.currentBatchIndex > 0,
        }
    }

    /**
     * Advance to next batch
     */
    nextBatch() {
        if (this.currentBatchIndex < this.totalBatches - 1) {
            this.currentBatchIndex++
            return this.getCurrentBatch()
        }
        return null
    }

    /**
     * Go to previous batch
     */
    prevBatch() {
        if (this.currentBatchIndex > 0) {
            this.currentBatchIndex--
            return this.getCurrentBatch()
        }
        return null
    }

    /**
     * Go to specific batch
     */
    goToBatch(index) {
        if (index >= 0 && index < this.totalBatches) {
            this.currentBatchIndex = index
            return this.getCurrentBatch()
        }
        return null
    }

    /**
     * Get batch info without videos (for summary)
     */
    getSummary() {
        return {
            totalVideos: this.videos.length,
            batchSize: this.batchSize,
            totalBatches: this.totalBatches,
            currentBatch: this.currentBatchIndex + 1,
        }
    }
}
