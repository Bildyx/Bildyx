<template id="modal-confirm-delete-team">
    <h2>Delete Team</h2>

    <p style="margin-top: 10px; line-height: 1.5;">
        Are you sure you want to delete
        <strong data-field="teamNameToDelete"></strong>?
        This will remove all team members and profile data.
        This action cannot be undone.
    </p>

    <footer style="margin-top: 24px; display: flex; justify-content: flex-end; gap: 12px;">
        <button
            data-close-modal
            style="min-height: 38px; border-radius: 6px; padding: 0 20px; font-weight: 800; cursor: pointer; border: 1px solid #d7dce8; background: #fff;">
            No
        </button>

        <button
            class="ca-danger-button"
            style="min-height: 38px; border-radius: 6px; padding: 0 20px; font-weight: 800; cursor: pointer; background: #ef4444 !important; color: #fff !important; border: 1px solid #ef4444 !important;"
            data-confirm-delete-team-btn>
            Yes, Delete
        </button>
    </footer>
</template>