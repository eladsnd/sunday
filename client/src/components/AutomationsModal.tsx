import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { automationsApi } from '../api/boardsApi';
import type { Board } from '../types/board.types';

interface AutomationsModalProps {
    board: Board;
    isOpen: boolean;
    onClose: () => void;
}

export default function AutomationsModal({ board, isOpen, onClose }: AutomationsModalProps) {
    const queryClient = useQueryClient();
    const [selectedColumnId, setSelectedColumnId] = useState<string>('');
    const [triggerValue, setTriggerValue] = useState<string>('');
    const [targetGroupId, setTargetGroupId] = useState<string>('');

    const { data: automations } = useQuery({
        queryKey: ['automations', board.id],
        queryFn: () => automationsApi.getAll(board.id),
        enabled: isOpen,
    });

    const createAutomationMutation = useMutation({
        mutationFn: automationsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['automations', board.id] });
            // Reset form
            setSelectedColumnId('');
            setTriggerValue('');
            setTargetGroupId('');
        },
    });

    const deleteAutomationMutation = useMutation({
        mutationFn: automationsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['automations', board.id] });
        },
    });

    const handleCreate = () => {
        if (!selectedColumnId || !triggerValue || !targetGroupId) return;

        createAutomationMutation.mutate({
            boardId: board.id,
            triggerType: 'status_change',
            triggerConfig: {
                columnId: selectedColumnId,
                value: triggerValue,
            },
            actionType: 'move_to_group',
            actionConfig: {
                groupId: targetGroupId,
            },
        });
    };

    if (!isOpen) return null;

    // Filter for status columns
    const statusColumns = board.columns.filter((col) => col.type === 'status');

    // Get status options from the selected column settings
    const getStatusOptions = (columnId: string) => {
        const column = board.columns.find((c) => c.id === columnId);
        if (!column) return [];

        if (column.settings && column.settings.options) {
            return column.settings.options.map((opt: any) => opt.label);
        }

        return ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Accepted', 'Rejected', 'Withdrawn'];
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="modal-content" style={{
                backgroundColor: 'var(--color-bg-elevated)', padding: '2rem', borderRadius: 'var(--radius-lg)',
                width: '600px', maxWidth: '90%', maxHeight: '80vh', overflowY: 'auto',
                boxShadow: 'var(--shadow-xl)', border: '1px solid var(--color-border)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2>Automations</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                </div>

                <div className="create-automation" style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Create New Automation</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span>When status in</span>
                        <select
                            value={selectedColumnId}
                            onChange={(e) => setSelectedColumnId(e.target.value)}
                            style={{ padding: '0.5rem' }}
                        >
                            <option value="">Select Column</option>
                            {statusColumns.map((col) => (
                                <option key={col.id} value={col.id}>{col.label}</option>
                            ))}
                        </select>
                        <span>changes to</span>
                        <select
                            value={triggerValue}
                            onChange={(e) => setTriggerValue(e.target.value)}
                            style={{ padding: '0.5rem' }}
                        >
                            <option value="">Select Status</option>
                            {getStatusOptions(selectedColumnId).map((opt: string) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                        <span>move item to</span>
                        <select
                            value={targetGroupId}
                            onChange={(e) => setTargetGroupId(e.target.value)}
                            style={{ padding: '0.5rem' }}
                        >
                            <option value="">Select Group</option>
                            {board.groups.map((group) => (
                                <option key={group.id} value={group.id}>{group.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        className="btn btn-primary"
                        style={{ marginTop: '1rem' }}
                        onClick={handleCreate}
                        disabled={!selectedColumnId || !triggerValue || !targetGroupId}
                    >
                        Create Automation
                    </button>
                </div>

                <div className="automations-list">
                    <h3>Active Automations</h3>
                    {automations && automations.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                            {automations.map((automation: any) => (
                                <li key={automation.id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '1rem', borderBottom: '1px solid var(--color-border)'
                                }}>
                                    <div>
                                        When <strong>{board.columns.find((c) => c.id === automation.triggerConfig.columnId)?.label || 'Unknown Column'}</strong> changes to <span className="status-badge" style={{ backgroundColor: 'var(--color-primary)' }}>{automation.triggerConfig.value}</span>, move to <strong>{board.groups.find((g) => g.id === automation.actionConfig.groupId)?.name || 'Unknown Group'}</strong>
                                    </div>
                                    <button
                                        onClick={() => deleteAutomationMutation.mutate(automation.id)}
                                        style={{ color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted" style={{ marginTop: '1rem' }}>No active automations.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
