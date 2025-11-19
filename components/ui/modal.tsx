export default function Modal({ open, onClose, children }: any) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
            <div className="bg-slate-900 p-4 rounded-lg w-11/12 max-w-2xl">
                <button className="float-right text-white" onClick={onClose}>✕</button>
                {children}
            </div>
        </div>
    );
}
