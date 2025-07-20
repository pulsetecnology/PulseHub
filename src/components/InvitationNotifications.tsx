import { useState, useEffect } from 'react';
import { useNextAuth } from '@/hooks/useNextAuth';
import { FiCheck, FiX, FiBell } from 'react-icons/fi';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';
import useTranslation from '@/hooks/useTranslation';

interface Invitation {
  id: string;
  supplierId: string;
  supplierName: string;
  commission: number;
  createdAt: Date;
  relationId: string;
}

export default function InvitationNotifications() {
  const { user } = useNextAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { addToast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (user && user.type === 'revendedor') {
      fetchInvitations();
    }
  }, [user]);

  const fetchInvitations = async () => {
    try {
      const response = await fetch(`/api/supplier-reseller-relations?resellerId=${user?.id}&status=pending`);
      if (!response.ok) throw new Error('Falha ao buscar convites');
      
      const relations = await response.json();
      
      const invitationsList = relations.map((relation: any) => ({
        id: relation.id,
        supplierId: relation.supplier.id,
        supplierName: relation.supplier.name,
        commission: relation.commission,
        createdAt: new Date(relation.createdAt),
        relationId: relation.id
      }));
      
      setInvitations(invitationsList);
    } catch (error) {
      console.error('Erro ao buscar convites:', error);
    }
  };

  const handleAcceptInvitation = async (relationId: string) => {
    try {
      const response = await fetch(`/api/supplier-reseller-relations/${relationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved'
        })
      });

      if (!response.ok) throw new Error('Falha ao aceitar convite');

      // Remove o convite da lista
      setInvitations(prev => prev.filter(inv => inv.relationId !== relationId));
      addToast(t('notifications.inviteAccepted'), "success");
    } catch (error) {
      console.error(error);
      addToast(t('notifications.errorAccepting'), "error");
    }
  };

  const handleRejectInvitation = async (relationId: string) => {
    try {
      const response = await fetch(`/api/supplier-reseller-relations/${relationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected'
        })
      });

      if (!response.ok) throw new Error('Falha ao rejeitar convite');

      // Remove o convite da lista
      setInvitations(prev => prev.filter(inv => inv.relationId !== relationId));
      addToast(t('notifications.inviteRejected'), "info");
    } catch (error) {
      console.error(error);
      addToast(t('notifications.errorRejecting'), "error");
    }
  };

  if (!user || user.type !== 'revendedor' || invitations.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-1 rounded-full text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        <span className="sr-only">{t('notifications.view')}</span>
        <FiBell size={20} />
        <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-xs text-white text-center">
          {invitations.length}
        </span>
      </button>

      {showDropdown && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium">{t('notifications.supplierInvitations')}</h3>
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {invitation.supplierName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('notifications.commission')}: {invitation.commission}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {invitation.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAcceptInvitation(invitation.relationId)}
                        className="p-1 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30"
                        title={t('notifications.accept')}
                      >
                        <FiCheck size={16} />
                      </button>
                      <button
                        onClick={() => handleRejectInvitation(invitation.relationId)}
                        className="p-1 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                        title={t('notifications.reject')}
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="px-4 py-2 text-center">
              <Link
                href="/reseller/suppliers"
                className="text-xs text-primary hover:text-primary-hover"
                onClick={() => setShowDropdown(false)}
              >
                {t('notifications.viewAllSuppliers')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}