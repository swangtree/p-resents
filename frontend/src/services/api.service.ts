import { RecalculateRequest, RecalculateResponse, FinalizeRequest, FinalizeResponse } from '@/types/api.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiService {
  static async recalculate(request: RecalculateRequest): Promise<RecalculateResponse> {
    const response = await fetch(`${API_URL}/recalculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) throw new Error('Recalculate failed');
    return response.json();
  }

  static async finalize(request: FinalizeRequest): Promise<FinalizeResponse> {
    const response = await fetch(`${API_URL}/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) throw new Error('Finalize failed');
    return response.json();
  }

  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/`);
      return response.ok;
    } catch {
      return false;
    }
  }
}