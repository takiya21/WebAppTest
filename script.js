class NoteApp {
    constructor() {
        this.notes = [];
        this.loadNotes();
        this.init();
    }

    init() {
        document.getElementById('addNoteBtn').addEventListener('click', () => this.addNote());
        this.render();
    }

    addNote() {
        const note = {
            id: Date.now(),
            content: '',
            createdAt: new Date().toLocaleString('ja-JP'),
            isEditing: true
        };
        this.notes.unshift(note);
        this.saveNotes();
        this.render();
    }

    deleteNote(id) {
        if (confirm('このメモを削除しますか？')) {
            this.notes = this.notes.filter(note => note.id !== id);
            this.saveNotes();
            this.render();
        }
    }

    updateNote(id, content) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            note.content = content;
            note.isEditing = false;
            this.saveNotes();
            this.render();
        }
    }

    toggleEdit(id) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            note.isEditing = !note.isEditing;
            this.render();
            if (note.isEditing) {
                setTimeout(() => {
                    const textarea = document.getElementById(`textarea-${id}`);
                    if (textarea) {
                        textarea.focus();
                        textarea.selectionStart = textarea.value.length;
                    }
                }, 0);
            }
        }
    }

    render() {
        const container = document.getElementById('notesContainer');
        const emptyState = document.getElementById('emptyState');

        if (this.notes.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            container.innerHTML = this.notes.map(note => this.createNoteElement(note)).join('');
            this.attachEventListeners();
        }
    }

    createNoteElement(note) {
        if (note.isEditing) {
            return `
                <div class="note">
                    <div class="note-header">
                        <span class="note-date">${note.createdAt}</span>
                    </div>
                    <textarea 
                        id="textarea-${note.id}" 
                        class="note-textarea"
                        placeholder="メモを入力してください..."
                    >${note.content}</textarea>
                    <div class="note-actions">
                        <button class="btn btn-primary" data-save="${note.id}">保存</button>
                        <button class="btn btn-danger" data-delete="${note.id}">削除</button>
                    </div>
                </div>
            `;
        } else {
            const preview = note.content || '（空のメモ）';
            return `
                <div class="note">
                    <div class="note-header">
                        <span class="note-date">${note.createdAt}</span>
                    </div>
                    <div class="note-content">${this.escapeHtml(preview)}</div>
                    <div class="note-actions">
                        <button class="btn btn-primary" data-edit="${note.id}">編集</button>
                        <button class="btn btn-danger" data-delete="${note.id}">削除</button>
                    </div>
                </div>
            `;
        }
    }

    attachEventListeners() {
        // 編集ボタン
        document.querySelectorAll('[data-edit]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.edit);
                this.toggleEdit(id);
            });
        });

        // 保存ボタン
        document.querySelectorAll('[data-save]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.save);
                const textarea = document.getElementById(`textarea-${id}`);
                this.updateNote(id, textarea.value);
            });
        });

        // 削除ボタン
        document.querySelectorAll('[data-delete]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.delete);
                this.deleteNote(id);
            });
        });

        // テキストエリアでEnter + Ctrl/Cmd で保存
        document.querySelectorAll('.note-textarea').forEach(textarea => {
            textarea.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    const id = parseInt(textarea.id.replace('textarea-', ''));
                    this.updateNote(id, textarea.value);
                }
            });
        });
    }

    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }

    loadNotes() {
        const saved = localStorage.getItem('notes');
        this.notes = saved ? JSON.parse(saved) : [];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// アプリ起動
document.addEventListener('DOMContentLoaded', () => {
    new NoteApp();
});
