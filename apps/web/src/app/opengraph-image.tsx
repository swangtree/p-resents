import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Pareto Presents - Smart Gift Exchange Matching';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#15131c',
          padding: '40px',
        }}
      >
        {/* Gift box icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '30px',
          }}
        >
          <svg width="120" height="120" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="13" width="24" height="16" rx="2" fill="#ff7eba" stroke="#f6f1ee" strokeWidth="1.5"/>
            <rect x="2" y="9" width="28" height="6" rx="1.5" fill="#f9df57" stroke="#f6f1ee" strokeWidth="1.5"/>
            <rect x="14" y="9" width="4" height="20" fill="#39b16c" stroke="#f6f1ee" strokeWidth="1"/>
            <rect x="4" y="14" width="24" height="4" fill="#39b16c" stroke="#f6f1ee" strokeWidth="1"/>
            <circle cx="16" cy="7" r="3" fill="#6caade" stroke="#f6f1ee" strokeWidth="1"/>
            <ellipse cx="10" cy="6" rx="4" ry="3" fill="#6caade" stroke="#f6f1ee" strokeWidth="1"/>
            <ellipse cx="22" cy="6" rx="4" ry="3" fill="#6caade" stroke="#f6f1ee" strokeWidth="1"/>
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #ff7eba, #f9df57, #ff9c42, #39b16c, #6caade)',
              backgroundClip: 'text',
              color: 'transparent',
              margin: '0 0 20px 0',
              textAlign: 'center',
            }}
          >
            Pareto Presents
          </h1>
          <p
            style={{
              fontSize: '32px',
              color: '#f6f1ee',
              margin: '0',
              textAlign: 'center',
              opacity: 0.9,
            }}
          >
            Smart Gift Exchange Matching
          </p>
          <p
            style={{
              fontSize: '24px',
              color: '#f6f1ee',
              margin: '20px 0 0 0',
              textAlign: 'center',
              opacity: 0.7,
            }}
          >
            Algorithmic matching for Secret Santa & White Elephant
          </p>
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginTop: '40px',
          }}
        >
          <div
            style={{
              padding: '12px 24px',
              backgroundColor: '#ff7eba',
              borderRadius: '20px',
              color: '#15131c',
              fontSize: '20px',
              fontWeight: 600,
            }}
          >
            Max Utility
          </div>
          <div
            style={{
              padding: '12px 24px',
              backgroundColor: '#f9df57',
              borderRadius: '20px',
              color: '#15131c',
              fontSize: '20px',
              fontWeight: 600,
            }}
          >
            Max Fairness
          </div>
          <div
            style={{
              padding: '12px 24px',
              backgroundColor: '#39b16c',
              borderRadius: '20px',
              color: '#f6f1ee',
              fontSize: '20px',
              fontWeight: 600,
            }}
          >
            White Elephant
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
