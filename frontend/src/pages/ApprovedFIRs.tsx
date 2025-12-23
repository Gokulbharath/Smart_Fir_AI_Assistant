import React, { useEffect, useState } from 'react';
import { getFIRs, pdfUrl } from '../api/firService';

interface FIRItem {
  _id: string;
  firNumber: string;
  incident: string;
}

const ApprovedFIRs: React.FC = () => {
  const [firs, setFirs] = useState<FIRItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getFIRs('approved');
        setFirs(data);
        setCount(data.length);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Approved FIRs ({count})</h1>
      {loading && <div>Loading…</div>}
      <div className="space-y-4">
        {firs.map((f) => (
          <div key={f._id} className="p-4 border rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 flex items-center justify-between">
            <div>
              <div className="font-bold">{f.firNumber}</div>
              <div className="text-sm text-slate-500">{f.incident}</div>
            </div>
            <a href={pdfUrl(f._id)} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-lg bg-blue-600 text-white">Download PDF</a>
          </div>
        ))}
        {!loading && firs.length === 0 && <div className="text-slate-500">No approved FIRs.</div>}
      </div>
    </div>
  );
};

export default ApprovedFIRs;


