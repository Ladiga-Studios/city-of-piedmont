// The official City of Piedmont seal.
export default function Seal({ size = 46 }) {
  return (
    <img
      src="/images/brand/seal.png"
      alt="City of Piedmont, Alabama seal"
      width={size}
      height={size}
      style={{ display: 'block', flex: 'none', objectFit: 'contain' }}
    />
  );
}
