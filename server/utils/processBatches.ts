
export interface BatchConfig {
  batchSize?: number;
  delayMs?: number;
  onBatchComplete?: (batchIndex: number, total: number) => void;
  onItemComplete?: (index: number, total: number, item: any) => void;
  onError?: (item: any, error: Error) => void;
}

export interface BatchResult<T> {
  results: T[];
  errors: Array<{ item: any; error: Error }>;
  successCount: number;
  failureCount: number;
}

/**
 * Process items in batches with delays between batches
 * @param items - Array of items to process
 * @param processor - Async function that processes a single item
 * @param config - Configuration for batch processing
 */
export async function processBatches<TInput, TOutput>(
  items: TInput[],
  processor: (item: TInput) => Promise<TOutput>,
  config: BatchConfig = {}
): Promise<BatchResult<TOutput>> {
  const {
    batchSize = 25,
    delayMs = 2000,
    onBatchComplete,
    onItemComplete,
    onError,
  } = config;

  const results: TOutput[] = [];
  const errors: Array<{ item: TInput; error: Error }> = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchIndex = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(items.length / batchSize);

    console.log(
      `Processing batch ${batchIndex}/${totalBatches} (items ${i + 1}-${Math.min(i + batchSize, items.length)} of ${items.length})`
    );

    // Process batch concurrently
    const batchPromises = batch.map(async (item, index) => {
      try {
        const result = await processor(item);
        
        if (onItemComplete) {
          onItemComplete(i + index + 1, items.length, item);
        }
        
        return { success: true as const, result };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        
        if (onError) {
          onError(item, err);
        }
        
        return { success: false as const, item, error: err };
      }
    });

    const batchResults = await Promise.all(batchPromises);

    // Separate successes and failures
    batchResults.forEach((result) => {
      if (result.success) {
        results.push(result.result);
      } else {
        errors.push({ item: result.item, error: result.error });
      }
    });

    if (onBatchComplete) {
      onBatchComplete(batchIndex, totalBatches);
    }

    // Wait before next batch (except after the last batch)
    if (i + batchSize < items.length) {
      console.log(`Waiting ${delayMs}ms before next batch...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return {
    results,
    errors,
    successCount: results.length,
    failureCount: errors.length,
  };
}

/**
 * Process items sequentially with a delay between each item and retry logic
 * @param items - Array of items to process
 * @param processor - Async function that processes a single item
 * @param delayMs - Delay in milliseconds between items
 * @param maxRetries - Maximum number of retry attempts per item
 */
export async function processSequentially<TInput, TOutput>(
    items: TInput[],
    processor: (item: TInput) => Promise<TOutput>,
    delayMs: number = 100,
    maxRetries: number = 3
  ): Promise<BatchResult<TOutput>> {
    const results: TOutput[] = [];
    const errors: Array<{ item: TInput; error: Error }> = [];
  
    for (const [index, item] of items.entries()) {
      let retryCount = 0;
      let success = false;
  
      while (!success && retryCount < maxRetries) {
        try {
          console.log(
            `Processing ${index + 1}/${items.length}${retryCount > 0 ? ` - Retry ${retryCount}/${maxRetries}` : ''}`
          );
          
          const result = await processor(item);
          results.push(result);
          success = true;
          
          console.log(`✓ Successfully processed item ${index + 1}`);
  
          // Wait between requests (except after the last one)
          if (index < items.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        } catch (error) {
          retryCount++;
          const err = error instanceof Error ? error : new Error(String(error));
          
          if (retryCount >= maxRetries) {
            console.error(`✗ Failed to process item ${index + 1} after ${maxRetries} attempts:`, err.message);
            errors.push({ item, error: err });
            success = true; // Give up on this item
          } else {
            const waitTime = delayMs * Math.pow(2, retryCount); // Exponential backoff
            console.log(`Failed attempt ${retryCount}. Waiting ${waitTime}ms before retry...`);
            await new Promise((resolve) => setTimeout(resolve, waitTime));
          }
        }
      }
    }
  
    return {
      results,
      errors,
      successCount: results.length,
      failureCount: errors.length,
    };
  }