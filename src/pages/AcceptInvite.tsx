import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import './AcceptInvite.css';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setMessage('No invite token provided.');
      return;
    }
    // TODO: Add API endpoint to accept invite (verify token, set password, create staff)
    // For now, show that the link works
    setStatus('success');
    setMessage('Invite link received. Account setup coming soon.');
  }, [token]);

  return (
    <div className="accept-invite-page">
      <div className="accept-invite-card">
        <h1>Accept invitation</h1>
        {status === 'loading' && (
          <div className="accept-invite-loading">
            <Loader2 size={32} className="spin" />
            <p>Verifying invite...</p>
          </div>
        )}
        {status === 'success' && (
          <>
            <CheckCircle size={48} className="accept-invite-icon success" />
            <p>{message}</p>
            <Link to="/login" className="btn btn-primary">Go to login</Link>
          </>
        )}
        {(status === 'error' || status === 'invalid') && (
          <>
            <XCircle size={48} className="accept-invite-icon error" />
            <p>{message || 'This invite link is invalid or has expired.'}</p>
            <Link to="/login" className="btn btn-outline">Back to login</Link>
          </>
        )}
      </div>
    </div>
  );
}
