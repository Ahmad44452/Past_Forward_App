import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import DatePicker from "react-native-date-picker";

const SetMessageTimerModal = ({ setIsModalVisible, setDate, date }) => {
  //   const [mode, setMode] = useState("date");
  //   const [open, setOpen] = useState(false);
  //   const [date, setDate] = useState(new Date());

  //   const onChange = (event, selectedDate) => {
  //     if (event.type === "set") {
  //       setDate(selectedDate);
  //       if (mode === "date") {
  //         setMode("time");
  //       } else {
  //         setIsModalVisible(false);
  //       }
  //     } else if (event.type === "dismissed") {
  //       // setDate = false here. We can use this variable to identify, if user wants to send a schedule message or not
  //       setIsModalVisible(false);
  //       if (mode === "time" && date?.getTime() !== selectedDate.getTime()) {
  //         setDate(false);
  //       }
  //     }
  //   };

  return (
    <DatePicker
      modal
      mode="datetime"
      open={open}
      date={date || new Date()}
      onConfirm={(date) => {
        setDate(date);
        setIsModalVisible(false);
      }}
      onCancel={() => {
        setIsModalVisible(false);
        setDate(false);
      }}
    />
    //  <DateTimePicker
    //    minimumDate={new Date()}
    //    value={date ? date : new Date()}
    //    mode={mode}
    //    onChange={onChange}
    //  />
  );
};

export default SetMessageTimerModal;
