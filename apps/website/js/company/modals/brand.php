<template id="modal-brand">
    <h2>Add Brand</h2>
    <p>Enter brand details and link it to a product/service.</p>

    <label>Brand Name</label>
    <input data-field="name" placeholder="e.g. Epsilon Cola">

    <label>Brand Logo</label>
    <button class="upload mini" type="button">⇧ Upload Logo</button>

    <label>Brand Tier</label>
    <select data-field="status">
        <option>Select brand tier</option>
        <option>Flagship</option>
        <option>Core</option>
        <option>Growth/Emerging</option>
        <option>Niche</option>
    </select>

    <footer>
        <button data-close-modal>Cancel</button>
        <button class="primary" data-add-item="brands">Add Brand</button>
    </footer>
</template>