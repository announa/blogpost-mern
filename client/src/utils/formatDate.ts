import { format } from 'date-fns';
const DATE_FORMAT = 'ee/MM/yyyy, kk:mm';

export const formatDate = (date?: string | Date | number) => {
  if(!date){
    return undefined
  }
  const newDate = new Date(date);
  return format(newDate, DATE_FORMAT);
};
