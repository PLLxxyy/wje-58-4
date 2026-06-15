import { useEffect, useState } from 'react';
import {
  Save,
  FolderOpen,
  Trash2,
  Edit3,
  Check,
  X,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useDraftStore } from '../../store/useDraftStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import type { EffectSettings } from '../../types';

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateText(text: string, maxLen: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > maxLen ? clean.slice(0, maxLen) + '…' : clean;
}

export function DraftBox() {
  const { drafts, loadDrafts, saveDraft, deleteDraft, renameDraft } =
    useDraftStore();
  const settings = useSettingsStore();
  const [expanded, setExpanded] = useState(true);
  const [saveName, setSaveName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  const currentSettings: EffectSettings = {
    text: settings.text,
    font: settings.font,
    fontSize: settings.fontSize,
    errorRate: settings.errorRate,
    ghostIntensity: settings.ghostIntensity,
    inkDensity: settings.inkDensity,
    misalignment: settings.misalignment,
    paperAge: settings.paperAge,
  };

  const handleSave = () => {
    saveDraft(saveName, currentSettings);
    setSaveName('');
  };

  const handleLoad = (draftId: string) => {
    const draft = useDraftStore.getState().getDraft(draftId);
    if (draft) {
      settings.updateSettings(draft.settings);
    }
  };

  const handleDelete = (draftId: string) => {
    if (confirm('确定要删除这个草稿吗？')) {
      deleteDraft(draftId);
    }
  };

  const startRename = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const confirmRename = () => {
    if (editingId && editingName.trim()) {
      renameDraft(editingId, editingName);
    }
    setEditingId(null);
    setEditingName('');
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditingName('');
  };

  return (
    <div className="w-full bg-paper/80 backdrop-blur-sm border-2 border-ink/20 rounded-xl shadow-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-ink/5 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-ink">
          <FileText className="w-4 h-4" />
          草稿箱
          <span className="text-xs text-ink/50">({drafts.length})</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-ink/50" />
        ) : (
          <ChevronDown className="w-4 h-4 text-ink/50" />
        )}
      </button>

      {expanded && (
        <div className="px-6 pb-6 space-y-4 border-t border-ink/10 pt-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-ink/70">
              保存当前设置为草稿
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="输入草稿名称..."
                className="flex-1 px-3 py-2 bg-paper border-2 border-ink/30 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-accent-red/50 focus:border-accent-red
                           text-sm text-ink placeholder-ink/30 transition-colors"
              />
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-4 py-2 bg-accent-red text-paper rounded-lg text-sm font-medium
                           hover:bg-accent-red/90 active:bg-accent-red/80 transition-colors
                           focus:outline-none focus:ring-2 focus:ring-accent-red/50"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-ink/70">
              我的草稿
            </label>
            {drafts.length === 0 ? (
              <div className="py-8 text-center text-ink/40 text-sm border-2 border-dashed border-ink/15 rounded-lg">
                暂无草稿，调整设置后保存一下吧
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="group bg-paper border-2 border-ink/15 rounded-lg p-3 hover:border-ink/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {editingId === draft.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') confirmRename();
                                if (e.key === 'Escape') cancelRename();
                              }}
                              autoFocus
                              className="flex-1 px-2 py-1 bg-paper border-2 border-accent-red/50 rounded text-sm text-ink
                                         focus:outline-none focus:ring-1 focus:ring-accent-red/50"
                            />
                            <button
                              onClick={confirmRename}
                              className="p-1 text-ink/60 hover:text-accent-red transition-colors"
                              title="确认"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelRename}
                              className="p-1 text-ink/60 hover:text-ink/80 transition-colors"
                              title="取消"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="font-medium text-sm text-ink truncate">
                            {draft.name}
                          </div>
                        )}
                        <div className="text-xs text-ink/50 mt-0.5">
                          {formatDate(draft.updatedAt)}
                        </div>
                        {draft.settings.text && (
                          <div className="text-xs text-ink/40 mt-1 truncate">
                            {truncateText(draft.settings.text, 40)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-ink/10">
                      <button
                        onClick={() => handleLoad(draft.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs
                                   bg-ink/5 text-ink rounded hover:bg-ink/10 transition-colors"
                        title="加载此草稿"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        加载
                      </button>
                      <button
                        onClick={() => startRename(draft.id, draft.name)}
                        className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs
                                   bg-ink/5 text-ink rounded hover:bg-ink/10 transition-colors"
                        title="重命名"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(draft.id)}
                        className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs
                                   bg-accent-red/10 text-accent-red rounded hover:bg-accent-red/20 transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
