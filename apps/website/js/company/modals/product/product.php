<template id="modal-product">
    <h2>Add Product/Service</h2>
    <p class="ca-modal-lead">Type at least 5 characters to search for a product or service.</p>

    <label>Product/Service</label>

    <div style="position: relative; margin-top: 10px;">
        <input data-field="prodSearchInput" placeholder="Search product/service..." autocomplete="off">

        <ul
            class="ca-cselect-panel"
            data-field="prodSearchResults"
            style="display: none; position: absolute; left: 0; right: 0; background: #fff; border: 1px solid #d7dce8; border-radius: 8px; max-height: 200px; overflow-y: auto; z-index: 100; margin: 4px 0; padding: 0; list-style: none; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">
        </ul>
    </div>

    <input type="hidden" data-field="selectedProdId">

    <label style="margin-top: 14px;">Product/Service Status *</label>

    <select
        data-field="prodStatus"
        style="width: 100%; min-height: 42px; border-radius: 8px; border: 1px solid #d7dce8; padding: 0 12px; font-size: 14px; color: #1e293b; background: #fff; margin-top: 6px; margin-bottom: 16px;">
        <option value="" disabled selected>Select status...</option>
        <option value="MAIN_FOCUS">Main Focus (Our #1 Priority)</option>
        <option value="HIGH_PRIORITY">High Priority (Core Products/Services)</option>
        <option value="RUNNER_UP">Runner Ups (New or Smaller Projects)</option>
    </select>

    <footer>
        <button class="ca-cancel" type="button" data-close-modal>Cancel</button>
        <button class="ca-primary" type="button" data-add-product-portfolio disabled>Add Product/Service</button>
    </footer>
</template>