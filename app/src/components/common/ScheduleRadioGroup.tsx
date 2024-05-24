import { HStack, Radio, RadioGroup } from '@chakra-ui/react';
import { UseFormRegister } from 'react-hook-form';

type Props = {
  register: UseFormRegister<any>;
  registerPropPath: string;
  defaultValue: string;
  enableDayOption: boolean;
};

export const ScheduleRadioGroup = ({
  register,
  registerPropPath,
  defaultValue,
  enableDayOption,
}: Props) => {
  return (
    <RadioGroup name='scheduleRadio' defaultValue={`${defaultValue}`}>
      <HStack pt={2} pb={2}>
        <Radio value='yearly' {...register(`${registerPropPath}`)}>
          Year
        </Radio>
        <Radio value='monthly' {...register(`${registerPropPath}`)}>
          Month
        </Radio>
        <Radio value='weekly' {...register(`${registerPropPath}`)}>
          Week
        </Radio>
        {enableDayOption && (
          <Radio value='daily' {...register(`${registerPropPath}`)}>
            Day
          </Radio>
        )}
      </HStack>
    </RadioGroup>
  );
};
