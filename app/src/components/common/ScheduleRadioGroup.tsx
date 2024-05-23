import { HStack, Radio, RadioGroup } from '@chakra-ui/react';
import { UseFormRegister } from 'react-hook-form';

type Props = {
  register: UseFormRegister<any>;
  registerPropPath: string;
  defaultValue: string;
};

export const ScheduleRadioGroup = ({
  register,
  registerPropPath,
  defaultValue,
}: Props) => {
  return (
    <RadioGroup defaultValue={`${defaultValue}`}>
      <HStack>
        <Radio value='yearly' {...register(`${registerPropPath}`)}>
          Year
        </Radio>
        <Radio value='monthly' {...register(`${registerPropPath}`)}>
          Month
        </Radio>
        <Radio value='weekly' {...register(`${registerPropPath}`)}>
          Week
        </Radio>
        <Radio value='daily' {...register(`${registerPropPath}`)}>
          Day
        </Radio>
      </HStack>
    </RadioGroup>
  );
};
