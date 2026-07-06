import Link from 'next/link';
export default function NotFound() {
  return (
    <section className="page-hero" style={{minHeight:'70vh',display:'flex',alignItems:'center'}}>
      <div className="container inner" style={{textAlign:'center',margin:'0 auto'}}>
        <p className="eyebrow">Error 404</p>
        <h1>Page not found</h1>
        <p style={{margin:'1rem auto 2rem'}}>We couldn't find that page. It may have moved or no longer exists.</p>
        <Link href="/" className="btn btn-primary">Back to Home</Link>
      </div>
    </section>
  );
}
