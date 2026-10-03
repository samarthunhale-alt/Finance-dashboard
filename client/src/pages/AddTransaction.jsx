import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tags } from 'lucide-react';
import { useCategories } from '../hooks/useCategories.js';
import { ErrorState, PageHeader, PageLoader } from '../components/ui.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import CategoryManager from '../components/CategoryManager.jsx';

export default function AddTransaction() {
  const navigate = useNavigate();
  const { categories, loading, error, reload } = useCategories();
  const [managing, setManaging] = useState(false);

  return (
    <>
      <PageHeader
        title="Add transaction"
        description="Record money coming in or going out."
        actions={<button type="button" className="btn-secondary" onClick={() => setManaging(true)}><Tags className="h-4 w-4" /> Manage categories</button>}
      />
      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <div className="card max-w-xl p-6">
          <TransactionForm categories={categories} onSaved={() => navigate('/app/transactions')} onCancel={() => navigate(-1)} />
        </div>
      )}
      <CategoryManager open={managing} onClose={() => setManaging(false)} categories={categories} onChanged={reload} />
    </>
  );
}
