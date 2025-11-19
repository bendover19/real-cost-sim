// app/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <div className="prose max-w-3xl mx-auto p-6">
      <h1>Privacy & Cookie Policy</h1>
      <p>Last updated: November 2025</p>

      <h2>1. Who we are</h2>
      <p>
        This website (“we”, “our”, or “us”) provides the Real Cost Simulator – an
        interactive tool to help you understand the real cost of working. This tool
        is for reflection and education only and does not provide formal financial advice.
      </p>

      <h2>2. What data we collect</h2>
      <p>We collect two main categories of data:</p>
      <ol>
        <li>
          <strong>Calculator inputs & session data</strong>
          <ul>
            <li>
              The numbers you enter into the simulator, such as income, rent or
              mortgage, childcare estimates, commute costs, debt repayments, savings
              rate and similar financial assumptions.
            </li>
            <li>
              Context fields such as country/region, household type, commute mode,
              hours worked, and the “driver” sliders you adjust (e.g. belonging,
              identity, time trade).
            </li>
            <li>
              A random session ID stored in a cookie/local storage so we can keep
              your scenario together, avoid duplicate rows and understand usage.
            </li>
          </ul>
        </li>
        <li>
          <strong>Contact details (optional)</strong>
          <ul>
            <li>
              If you choose to type your email address to “save & email my plan”, we
              store that email so we can send you your results and optionally follow
              up with product updates. You can ask us to delete your email at any time.
            </li>
          </ul>
        </li>
      </ol>
      <p>
        We do <strong>not</strong> ask for or store bank account details, credit card
        numbers, government ID numbers, or passwords.
      </p>

      <h2>3. How we use this data</h2>
      <ul>
        <li>To run the calculator and show your results back to you.</li>
        <li>
          To analyse usage in aggregate (for example, “how many people have long
          commutes?”) so we can improve the tool.
        </li>
        <li>
          To email you your plan and relevant updates, if you have given us your email.
        </li>
        <li>
          To detect abuse or technical issues (for example, repeated bot traffic).
        </li>
      </ul>
      <p>
        We do not sell your personal data. Aggregated, anonymised statistics may be
        used to talk about how the tool is being used.
      </p>

      <h2>4. Cookies & advertising</h2>
      <p>
        We use cookies and similar technologies to run the site, remember your
        session, and measure basic analytics. We also use Google AdSense to display
        ads on this site.
      </p>
      <p>
        Google and its partners may use cookies and device identifiers to show ads
        based on your visits to this and other sites. You can learn more about how
        Google uses data from partner sites here:&nbsp;
        <a
          href="https://policies.google.com/technologies/partner-sites"
          target="_blank"
          rel="noreferrer"
        >
          https://policies.google.com/technologies/partner-sites
        </a>.
      </p>
      <p>
        Where required, you will see a consent banner that lets you manage your
        advertising and analytics cookie preferences.
      </p>

      <h2>5. Data storage & retention</h2>
      <p>
        Calculator responses are stored in our database together with a random session
        ID, and optionally your email address if you provide it. We keep this data
        only for as long as necessary to operate the site, understand usage, and
        maintain reasonable business records. We may keep aggregated, anonymised
        statistics for longer.
      </p>

      <h2>6. Your rights</h2>
      <p>
        Depending on where you live, you may have rights over your personal data,
        such as the right to access, correct, or delete it, and to object to certain
        types of processing.
      </p>
      <p>
        If you would like to request deletion of your email address or associated
        responses, please contact us using the email below and include the email
        address you used in the tool.
      </p>

      <h2>7. Contact</h2>
      <p>
        For any privacy questions or requests, contact us at{" "}
        <strong>jack@energy-outcomes.com</strong>.
      </p>
    </div>
  );
}
