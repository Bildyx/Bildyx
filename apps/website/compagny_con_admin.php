<?php
$pageTitle = 'Company Admin — Bildyx';
$pageDescription = 'Create and manage your connected company profile on Bildyx.';
$pageScript = 'js/compagny_con_admin.ts';
$bodyClass = 'company-page compagny-admin-page';
$showMainNav = false;
$headerMode = 'company-admin';
$headerCenterLabel = 'F-CAREER';
$headerBackHref = 'compagny_con.php';
$headerBackLabel = '‹ Preview company page';
$headerStatusLabel = 'Unpublished';

ob_start();
require __DIR__ . '/includes/header.php';
$sharedHeader = ob_get_clean();
$adminStylesheet = '<link rel="stylesheet" href="css/compagny_con_admin.css" />';
echo str_replace('</head>', "    {$adminStylesheet}\n</head>", $sharedHeader);
?>
<script>
(function(){const raw=sessionStorage.getItem('bildyx_session')||localStorage.getItem('bildyx_session');if(!raw)return;try{const s=JSON.parse(raw);const t=String(s.accountType||s.role||'').toLowerCase().replace(/[\s_-]/g,'');if(t&&t!=='company')location.href='profile.php';}catch(e){}})();
</script>
<main class="ca-page">

  <div class="ca-shell">
    <aside class="ca-left">
      <section class="ca-profile-box"><button class="ca-logo" type="button" data-open-modal="logo">⇧<small>Upload Logo</small></button><h1 contenteditable="true" data-company-name>F-Career</h1><p>Company Profile</p><small>Profile URL<br><b>bildyx.com/f-career</b></small></section>
      <h2>Parent Company</h2><button class="ca-parent" type="button" data-open-modal="parent">▥<span>Add your parent company if applicable</span></button>
    </aside>
    <section class="ca-main">
      <header class="ca-builder"><span></span><b>Profile Builder</b><p>— Start building your company profile by adding teams, products, and more</p></header>
      <section><div class="ca-section-head"><h2>Our Teams</h2><div><button class="ca-save" type="button" data-save-public>✓ Save</button><button class="ca-cancel-top" type="button" data-reset-draft>× Cancel</button></div></div>
        <div class="ca-team-panel"><div class="ca-team-main">
          <div class="ca-actions"><button data-open-modal="team">+ Add New Team</button><button data-open-modal="member">♙ Add Team Members</button></div>
          <div class="ca-tabs" id="caTeamTabs"></div><div class="ca-members" id="caMembers"><div class="ca-empty">No team members added yet. Use “Add Team Members” to build this team.</div></div>
          <div class="ca-sub"><h3>Our Offices</h3><button data-open-modal="city">+ Add City</button></div><div class="ca-chips" id="caOffices"></div>
          <div class="ca-sub"><h3>Main Products / Services</h3><div><button data-open-modal="product">+ Add Product/Service</button><button data-open-modal="brand">+ Add Brand</button></div></div><div class="ca-chips" id="caProducts"></div>
        </div><aside class="ca-profile-side"><div><h3>Team Profile</h3><button data-open-modal="profile">+ Add</button></div><i></i><div id="caTeamProfile"><p>No team profile added yet.</p></div><footer><button class="is-active" data-mode="people">People</button><button data-mode="operate">How We Operate</button></footer></aside></div>
      </section>
      <section class="ca-block"><header><span>Our Product &amp; Service Portfolio</span><button data-open-modal="product">+ Add Product/Service</button></header><div id="caPortfolio">No products or services added yet.</div></section>
      <section class="ca-block"><header><span>Photos</span><small id="caPhotosCount">0/10</small><button data-open-modal="photos">+ Add Photos</button></header><div id="caPhotos">No photos added yet.</div></section>
      <section class="ca-block"><header><span>Partners</span><button data-open-modal="partner">+ Add Partner</button></header><div id="caPartners">No partners added yet.</div></section>
      <section class="ca-block"><header><span>Customers</span><button data-open-modal="customer">+ Add Customer</button></header><div id="caCustomers">No customers added yet.</div></section>
      <section class="ca-block"><header><span>Investors</span><button data-open-modal="investor">+ Add Investor</button></header><div id="caInvestors">No investors added yet.</div></section>
      <section class="ca-block"><header><span>Subsidiaries</span><button data-open-modal="subsidiary">+ Add Subsidiary</button></header><div id="caSubsidiaries">No subsidiaries added yet.</div></section>
    </section>
    <aside class="ca-nav"><a class="is-active" href="compagny_con_admin.php">☻ Profile</a><a href="#">▣ About Me</a><a href="#">▥ My Job Ads</a><a href="#">⚙ Settings</a></aside>
  </div>
</main>
<div class="ca-toast" id="caToast"></div><div class="ca-overlay" id="companyAdminModal"><div class="ca-modal"><button class="ca-x" data-close-modal></button><div id="companyAdminModalContent"></div></div></div>
<template id="modal-team"><h2>Add New Team</h2><p>Fill in the details to create a new team.</p><label>Team Type</label><select data-field="teamType"><option>Select team type</option><option>Engineering</option><option>Marketing</option><option>Sales</option></select><label>Name of Team</label><input data-field="teamName" maxlength="35" placeholder="e.g. Team Epsilon"><small class="ca-counter">0/35</small><label>Visibility</label><select><option>Public Team</option><option>Private Team</option></select><label>City</label><select><option>Select city</option><option>Tokyo</option><option>Paris</option><option>Seattle</option></select><footer><button data-close-modal>Cancel</button><button class="primary" data-create-team>Create Team</button></footer></template>
<template id="modal-member"><h2>Add Team Members</h2><p>Add a new or existing member to a team.</p><label>Select Team</label><select data-field="teamId"></select><label>Name of Member</label><input data-field="memberName" placeholder="Name of member..."><label>Job Title</label><input data-field="jobTitle" placeholder="Type at least 3 letters..."><label>Profile Image</label><button class="upload" type="button">⇧<b>Click to upload image</b><small>JPG, PNG up to 5MB</small></button><footer><button data-close-modal>Cancel</button><button class="primary" data-add-member>Add Member</button></footer></template>
<template id="modal-profile"><h2>Add Team Profile</h2><p>Describe your team across all 10 dimensions.</p><label>Select Team</label><select data-field="teamId"></select><hr><b class="mini">PEOPLE</b><label>Who We Are</label><textarea data-field="who"></textarea><label>What We're Great At</label><textarea data-field="great"></textarea><label>Team Culture</label><textarea data-field="culture"></textarea><label>How We Work Together</label><textarea data-field="work"></textarea><label>This team is NOT for you if...</label><textarea data-field="notFor"></textarea><hr><b class="mini">HOW WE OPERATE</b><label>How We're Led</label><textarea data-field="led"></textarea><label>What We're Solving Now</label><textarea data-field="solving"></textarea><label>A Typical Day</label><textarea data-field="day"></textarea><label>What We Value</label><textarea data-field="value"></textarea><label>Growth Here</label><textarea data-field="growth"></textarea><footer><button data-close-modal>Cancel</button><button class="primary" data-save-profile>Save Profile</button></footer></template>
<template id="modal-product"><h2>Add Product/Service</h2><p>Type at least 5 characters to search for a product or service.</p><input data-field="name" placeholder="Search product/service..."><label>Product/Service Status</label><select data-field="status"><option>Select status...</option><option>Main Focus</option><option>High Priority</option><option>Runner Ups</option></select><footer><button data-close-modal>Cancel</button><button class="primary" data-add-item="products">Add Product</button></footer></template>
<template id="modal-brand"><h2>Add Brand</h2><p>Enter brand details and link it to a product/service.</p><label>Brand Name</label><input data-field="name" placeholder="e.g. Epsilon Cola"><label>Brand Logo</label><button class="upload mini" type="button">⇧ Upload Logo</button><label>Brand Tier</label><select data-field="status"><option>Select brand tier</option><option>Flagship</option><option>Core</option><option>Growth/Emerging</option><option>Niche</option></select><footer><button data-close-modal>Cancel</button><button class="primary" data-add-item="brands">Add Brand</button></footer></template>
<template id="modal-city"><h2>Add City</h2><p>Type at least 3 characters to search for a city.</p><input data-field="name" placeholder="Search city..."><footer><button data-close-modal>Cancel</button><button class="primary" data-add-item="offices">Add City</button></footer></template>
<template id="modal-partner"><h2>Add Partner</h2><p>Type at least 3 characters to search for an organization.</p><input data-field="name" placeholder="Search organization..."><footer><button data-close-modal>Cancel</button><button class="primary" data-add-item="partners">Add Partner</button></footer></template>
<template id="modal-customer"><h2>Add Customer</h2><p>Type at least 3 characters to search for a customer.</p><input data-field="name" placeholder="Search customer..."><footer><button data-close-modal>Cancel</button><button class="primary" data-add-item="customers">Add Customer</button></footer></template>
<template id="modal-investor"><h2>Add Investor</h2><p>Type at least 3 characters to search for an investor.</p><input data-field="name" placeholder="Search investor..."><footer><button data-close-modal>Cancel</button><button class="primary" data-add-item="investors">Add Investor</button></footer></template>
<template id="modal-subsidiary"><h2>Add Subsidiary</h2><p>Type at least 3 characters to search for a subsidiary.</p><input data-field="name" placeholder="Search subsidiary..."><footer><button data-close-modal>Cancel</button><button class="primary" data-add-item="subsidiaries">Add Subsidiary</button></footer></template>
<template id="modal-photos"><h2>Add Photos</h2><p>Upload photos of your workspace, team, or culture.</p><button class="upload" type="button">⇧<b>Click to upload photos</b><small>JPG, PNG up to 5MB</small></button><footer><button data-close-modal>Cancel</button><button class="primary" data-add-photo>Add Photos</button></footer></template>
<template id="modal-logo"><h2>Upload Logo</h2><p>Upload your company logo.</p><button class="upload" type="button">⇧<b>Click to upload logo</b><small>JPG, PNG up to 5MB</small></button><footer><button data-close-modal>Cancel</button><button class="primary" data-close-modal>Save Logo</button></footer></template>
<template id="modal-parent"><h2>Add Parent Company</h2><p>Search and connect the parent company if applicable.</p><input data-field="name" placeholder="Search parent company..."><footer><button data-close-modal>Cancel</button><button class="primary" data-add-parent>Add Parent Company</button></footer></template>
<?php require __DIR__ . '/includes/footer.php'; ?>
