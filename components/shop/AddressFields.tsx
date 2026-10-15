import { Field, inputClass } from '@/components/shop/ui';
import StateInput from '@/components/shop/StateInput';

export interface AddressValues {
  name?: string;
  line1?: string;
  city?: string;
  state?: string;
  zip?: string;
}

/** Name / street / city / state / zip inputs named `${prefix}_name`, `${prefix}_line1`, ... Used by the account and checkout forms. */
export default function AddressFields({
  prefix,
  defaults,
  autocomplete,
}: {
  prefix: 'bill' | 'ship';
  defaults?: AddressValues | null;
  autocomplete: 'billing' | 'shipping';
}) {
  const ac = (t: string) => `${autocomplete} ${t}`;
  return (
    <div className="space-y-4">
      <Field label="Full name" required>
        <input name={`${prefix}_name`} defaultValue={defaults?.name} autoComplete={ac('name')} required className={inputClass} />
      </Field>
      <Field label="Street address" required>
        <input name={`${prefix}_line1`} defaultValue={defaults?.line1} autoComplete={ac('street-address')} required className={inputClass} />
      </Field>
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="City" required>
          <input name={`${prefix}_city`} defaultValue={defaults?.city} autoComplete={ac('address-level2')} required className={inputClass} />
        </Field>
        <Field label="State" required>
          <StateInput name={`${prefix}_state`} defaultValue={defaults?.state} autoComplete={ac('address-level1')} required className={inputClass} />
        </Field>
        <Field label="Zip" required>
          <input name={`${prefix}_zip`} defaultValue={defaults?.zip} autoComplete={ac('postal-code')} required className={inputClass} />
        </Field>
      </div>
    </div>
  );
}
