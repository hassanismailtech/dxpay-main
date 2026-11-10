import { PageHeader } from '@/widgets/page-header/PageHeader';
import { TechFulfillmentView } from '@/features/tech-fulfillment/ui/TechFulfillmentView';

const TechFulfillmentPage = () => (
  <div>
    <PageHeader title="Fulfillment" subtitle="Diagnostic processing and verified order activity." />
    <TechFulfillmentView />
  </div>
);
export default TechFulfillmentPage;
