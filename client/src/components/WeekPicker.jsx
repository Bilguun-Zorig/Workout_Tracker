import React from 'react'
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import isoWeek from 'dayjs/plugin/isoWeek'; // <-- for Monday-based weeks
import { styled } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';

dayjs.extend(isBetween)
dayjs.extend(isoWeek)

const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) => prop !== 'isSelected' && prop !== 'isHovered',
})(({ theme, isSelected, isHovered, day }) => ({
  borderRadius: 0,
  ...(isSelected && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover, &:focus': {
      backgroundColor: theme.palette.primary.main,
    },
  }),
  ...(isHovered && {
    backgroundColor: theme.palette.primary.light,
    '&:hover, &:focus': {
      backgroundColor: theme.palette.primary.light,
    },
    ...theme.applyStyles?.('dark', {
      backgroundColor: theme.palette.primary.dark,
      '&:hover, &:focus': {
        backgroundColor: theme.palette.primary.dark,
      },
    }),
  }),
  // round the ends of the week row (Mon..Sun)
  ...(day.isoWeekday?.() === 1 && { borderTopLeftRadius: '50%', borderBottomLeftRadius: '50%' }),
  ...(day.isoWeekday?.() === 7 && { borderTopRightRadius: '50%', borderBottomRightRadius: '50%' }),
}));

const isInSameIsoWeek = (dayA, dayB) => !!dayB && dayA.isSame(dayB, 'week'); // dayjs respects isoWeek plugin

function Day(props) {
  const { day, selectedDay, hoveredDay, onSelectWeek, ...other } = props;

  const handleClick = () => {
    // clicking any day selects that whole week
    const start = day.startOf('week'); // if using isoWeek: day.startOf('week') already respects isoWeek plugin
    const end = day.endOf('week');
    onSelectWeek?.({ start, end, anchor: day });
  };

  return (
    <CustomPickersDay
      {...other}
      day={day}
      sx={{ px: 2.5 }}
      disableMargin
      selected={false}
      isSelected={isInSameIsoWeek(day, selectedDay)}
      isHovered={isInSameIsoWeek(day, hoveredDay)}
      onClick={handleClick}
    />
  );
}

const WeekPicker = ({ defaultValue = dayjs(), onWeekChange }) => {

  const [anchorDay, setAnchorDay] = React.useState(defaultValue); // any day within the selected week
  const [hoveredDay, setHoveredDay] = React.useState(null);

  const handleSelectWeek = ({ start, end, anchor }) => {
    setAnchorDay(anchor);
    onWeekChange?.({ start, end, anchor });
  };

  // fire initial selection
  React.useEffect(() => {
    const start = anchorDay.startOf('week');
    const end = anchorDay.endOf('week');
    onWeekChange?.({ start, end, anchor: anchorDay });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateCalendar
        value={anchorDay}
        onChange={(newValue) => handleSelectWeek({ start: newValue.startOf('week'), end: newValue.endOf('week'), anchor: newValue })}
        showDaysOutsideCurrentMonth
        displayWeekNumber
        slots={{ day: (slotProps) => (
          <Day
            {...slotProps}
            selectedDay={anchorDay}
            hoveredDay={hoveredDay}
            onSelectWeek={handleSelectWeek}
            onPointerEnter={() => setHoveredDay(slotProps.day)}
            onPointerLeave={() => setHoveredDay(null)}
          />
        )}}
      />
    </LocalizationProvider>
  )
}

export default WeekPicker