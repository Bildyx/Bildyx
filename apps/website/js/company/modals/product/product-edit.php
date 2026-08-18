<template id="modal-edit-product">
    <h2 id="companyAdminModalTitle">Edit Product/Service</h2>
    <p class="ca-modal-lead">Update or remove this product/service.</p>

    <input type="hidden" data-field="productId" />

    <label>Product/Service Name</label>
    <input data-field="productName" placeholder="Product/service name" />

    <label>Product/Service Status</label>

    <select data-field="productStatus">
        <option>Main Focus (Our #1 Priority)</option>
        <option>High Priority (Core Products/Services)</option>
        <option>Runner Ups (New or Smaller Projects)</option>
    </select>

    <footer>
        <button class="ca-danger-button" type="button" data-delete-product>Delete</button>
        <button class="ca-cancel" type="button" data-close-modal>Cancel</button>
        <button class="ca-primary" type="button" data-update-product>Update Product</button>
    </footer>
</template>