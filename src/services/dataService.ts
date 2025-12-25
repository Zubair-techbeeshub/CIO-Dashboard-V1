import Papa from 'papaparse';

/**
 * Resolve tenant ID safely.
 * CURRENT STATE:
 * - Single tenant: american_logics
 * - Subdomain is NOT treated as tenant yet
 * FUTURE:
 * - client1.techbeeshub.com → client1
 */
function getTenantId(): string {
  const hostname = window.location.hostname;

  // 1️⃣ Highest priority: build-time tenant override
  const envTenant = import.meta.env.VITE_TENANT_ID;
  if (envTenant && envTenant.trim().length > 0) {
    return envTenant.trim();
  }

  // 2️⃣ Known frontend domains → force single tenant
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.vercel.app') ||
    hostname === 'cio-dashboard.techbeeshub.com'
  ) {
    return 'american_logics';
  }

  // 3️⃣ FUTURE multi-tenant support (safe but inactive now)
  // client1.techbeeshub.com → client1
  const parts = hostname.split('.');
  if (parts.length >= 3 && parts[0] !== 'www') {
    return parts[0]
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_');
  }

  // 4️⃣ Absolute fallback (never break prod)
  return 'american_logics';
}

/**
 * Load CSV file for the resolved tenant
 */
export async function loadCSV(
  filename: string
): Promise<Record<string, any>[]> {
  const tenantId = getTenantId();

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'https://api.techbeeshub.com';

  // Normalize base URL
  const base = API_BASE_URL.replace(/\/$/, '');

  // ✅ CORRECT path (matches your backend exactly)
  const url = `${base}/data/${tenantId}/${filename}`;

  console.log('Loading CSV from:', url);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to load CSV (${response.status}): ${url}`
    );
  }

  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as Record<string, any>[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}
