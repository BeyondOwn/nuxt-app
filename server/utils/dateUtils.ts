/**
 * Converts ISO 8601 timestamp to friendly format
 * Example: "2025-11-25T18:02:47.412138+00:00" -> "November 25, 2025 at 6:02 PM"
 */
export function toFriendlyDate(isoString: string): string {
    const date = new Date(isoString);
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    return date.toLocaleString('en-US', options).replace(',', ' at');
  }
  
  /**
   * Converts to relative time format
   * Example: "2 hours ago", "3 days ago", "just now"
   */
  export function toRelativeTime(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);
  
    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHour < 24) return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
    if (diffDay < 7) return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`;
    if (diffWeek < 4) return `${diffWeek} ${diffWeek === 1 ? 'week' : 'weeks'} ago`;
    if (diffMonth < 12) return `${diffMonth} ${diffMonth === 1 ? 'month' : 'months'} ago`;
    return `${diffYear} ${diffYear === 1 ? 'year' : 'years'} ago`;
  }
  
  /**
   * Converts to short format
   * Example: "Nov 25, 2025"
   */
  export function toShortDate(isoString: string): string {
    const date = new Date(isoString);
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    return date.toLocaleDateString('en-US', options);
  }
  
  /**
   * Converts to date and time format
   * Example: "11/25/2025, 6:02 PM"
   */
  export function toDateTime(isoString: string): string {
    const date = new Date(isoString);
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    return date.toLocaleString('en-US', options);
  }
  
  /**
   * Smart format that chooses between relative and absolute based on recency
   * Shows relative time if within 7 days, otherwise shows short date
   */
  export function toSmartFormat(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
      return toRelativeTime(isoString);
    }
    
    return toShortDate(isoString);
  }
  
  // Usage examples:
  // const timestamp = "2025-11-25T18:02:47.412138+00:00";
  // toFriendlyDate(timestamp) // "November 25, 2025 at 6:02 PM"
  // toRelativeTime(timestamp) // "2 hours ago"
  // toShortDate(timestamp)    // "Nov 25, 2025"
  // toDateTime(timestamp)     // "11/25/2025, 6:02 PM"
  // toSmartFormat(timestamp)  // Automatically picks best format