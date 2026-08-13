<template id="modal-profile">
    <h2>Add Team Profile</h2>
    <p>Describe your team across all 10 dimensions so candidates know what to expect.</p>

    <label>Select Team</label>
    <select data-field="teamId"></select>

    <hr>

    <b class="mini">PEOPLE</b>

    <div class="ca-tfield">
        <div class="ca-tfield-head">
            <label>Who We Are</label>
            <span class="ca-wcount">0/30 words · 0/180 chars</span>
        </div>
        <textarea data-field="who_we_are" placeholder="Describe the team composition — backgrounds, experience levels, mix of skills..."></textarea>
    </div>

    <div class="ca-tfield">
        <div class="ca-tfield-head">
            <label>What We're Great At</label>
            <span class="ca-wcount">0/30 words · 0/180 chars</span>
        </div>
        <textarea data-field="what_were_great_at" placeholder="What does the team excel at? Core strengths, technical or creative advantages..."></textarea>
    </div>

    <div class="ca-tfield">
        <div class="ca-tfield-head">
            <label>Team Culture</label>
            <span class="ca-wcount">0/30 words · 0/180 chars</span>
        </div>
        <textarea data-field="team_culture" placeholder="How does the team interact day-to-day? Social dynamics, traditions, team rituals..."></textarea>
    </div>

    <div class="ca-tfield">
        <div class="ca-tfield-head">
            <label>How We Work Together</label>
            <span class="ca-wcount">0/30 words · 0/180 chars</span>
        </div>
        <textarea data-field="how_we_work_together" placeholder="Remote, hybrid, or in-office? Communication tools, meeting cadence, async vs sync..."></textarea>
    </div>

    <div class="ca-tfield">
        <div class="ca-tfield-head">
            <label>This team is NOT for you if...</label>
            <span class="ca-wcount">0/30 words · 0/180 chars</span>
        </div>
        <textarea data-field="this_team_is_not_for_you_if" placeholder="Be honest — what personality types or work styles won't thrive here?"></textarea>
    </div>

    <hr>

    <b class="mini">HOW WE OPERATE</b>

    <div class="ca-tfield">
        <div class="ca-tfield-head">
            <label>How We're Led</label>
            <span class="ca-wcount">0/30 words · 0/180 chars</span>
        </div>
        <textarea data-field="how_were_led" placeholder="Leadership style, decision-making process, manager expectations, feedback loops..."></textarea>
    </div>

    <div class="ca-tfield">
        <div class="ca-tfield-head">
            <label>What We're Solving Now</label>
            <span class="ca-wcount">0/30 words · 0/180 chars</span>
        </div>
        <textarea data-field="what_were_solving_now" placeholder="Current projects, key challenges, strategic priorities the team is focused on..."></textarea>
    </div>

    <div class="ca-tfield">
        <div class="ca-tfield-head">
            <label>A Typical Day</label>
            <span class="ca-wcount">0/30 words · 0/180 chars</span>
        </div>
        <textarea data-field="typical_day" placeholder="Walk through the daily rhythm — standups, deep work, breaks, end of day..."></textarea>
    </div>

    <div class="ca-tfield">
        <div class="ca-tfield-head">
            <label>What We Value</label>
            <span class="ca-wcount">0/30 words · 0/180 chars</span>
        </div>
        <textarea data-field="what_we_value" placeholder="Core values in action — how disagreements are handled, what's celebrated..."></textarea>
    </div>

    <div class="ca-tfield">
        <div class="ca-tfield-head">
            <label>Growth Here</label>
            <span class="ca-wcount">0/30 words · 0/180 chars</span>
        </div>
        <textarea data-field="growth_here" placeholder="Learning opportunities, promotion paths, mentorship, conference budgets..."></textarea>
    </div>

    <footer>
        <button data-close-modal>Cancel</button>
        <button class="primary" data-save-profile>Save Profile</button>
    </footer>
</template>