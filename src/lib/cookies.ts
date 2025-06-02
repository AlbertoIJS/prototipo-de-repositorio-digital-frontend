export function setCookie(name: string, value: string, options: {
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
} = {}) {
  try {
    const {
      maxAge = 60 * 60 * 24 * 7, // 7 days default
      path = '/',
      domain,
      secure = false, // Disable secure flag for development
      sameSite = 'Lax'
    } = options;

    const encodedValue = encodeURIComponent(value);
    
    let cookieString = `${name}=${encodedValue}`;
    
    if (maxAge) cookieString += `; max-age=${maxAge}`;
    if (path) cookieString += `; path=${path}`;
    if (domain) cookieString += `; domain=${domain}`;
    if (secure) cookieString += `; secure`;
    if (sameSite) cookieString += `; samesite=${sameSite}`;
    
    console.log(`Setting cookie: ${name}`, { 
      originalLength: value.length, 
      encodedLength: encodedValue.length,
      cookieString: cookieString.substring(0, 100) + '...',
      fullCookieString: cookieString.length > 4000 ? 'TOO_LONG' : 'OK'
    });
    
    // Show current cookies before setting
    console.log("Current cookies before setting:", document.cookie);
    
    document.cookie = cookieString;
    
    // Show current cookies after setting
    console.log("Current cookies after setting:", document.cookie);
    
    // Verify the cookie was set
    const wasSet = document.cookie.includes(`${name}=`);
    console.log(`Cookie ${name} was ${wasSet ? 'successfully set' : 'NOT set'}`);
    
    return wasSet;
  } catch (error) {
    console.error(`Error setting cookie ${name}:`, error);
    return false;
  }
}

export function getCookie(name: string): string | null {
  try {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        const encodedValue = c.substring(nameEQ.length, c.length);
        return decodeURIComponent(encodedValue);
      }
    }
    return null;
  } catch (error) {
    console.error(`Error getting cookie ${name}:`, error);
    return null;
  }
}

export function deleteCookie(name: string, path: string = '/') {
  document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
} 