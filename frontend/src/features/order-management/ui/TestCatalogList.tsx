import { DiagnosticTest } from '@/entities/test/model/types';
import { TestListItem } from '@/entities/test/ui/TestListItem';
import { useOrderStore } from '../model/useOrderStore';

export const TestCatalogList = ({ tests }: { tests: DiagnosticTest[] }) => {
  const { selectedTests, addTest, removeTest, isGenerating } = useOrderStore();
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {tests.map((test) => (
        <TestListItem
          key={test.id}
          test={test}
          isSelected={selectedTests.some((item) => item.id === test.id)}
          onAdd={() => addTest(test)}
          onRemove={() => removeTest(test.id)}
          disabled={isGenerating}
        />
      ))}
    </div>
  );
};
