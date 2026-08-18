<template id="modal-investor">
    <h2>Add Investor</h2>
    <p>Type to search for an investor organization.</p>

    <div style="position: relative; margin-top: 10px;">
        <input
            data-field="orgSearchInput"
            placeholder="Search investor..."
            autocomplete="off">

        <ul
            class="ca-cselect-panel"
            data-field="orgSearchResults"
            style="display: none; position: absolute; left: 0; right: 0; background: #fff; border: 1px solid #d7dce8; border-radius: 8px; max-height: 200px; overflow-y: auto; z-index: 100; margin: 4px 0; padding: 0; list-style: none; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">
        </ul>
    </div>

    <input type="hidden" data-field="selectedOrgId">

    <footer>
        <button data-close-modal>Cancel</button>
        <button class="primary" data-add-item="investors" disabled>Add Investor</button>
    </footer>
</template>