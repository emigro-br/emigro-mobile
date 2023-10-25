import { styled } from 'nativewind';
import React from 'react';
import { Modal, Text, View } from 'react-native';

const StyledView = styled(View);
const StyledText = styled(Text);

type CustomModalProps = {
  isVisible: boolean;
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
};

const CustomModal: React.FunctionComponent<CustomModalProps> = ({ isVisible, title, children }) => {
  return (
    <Modal animationType="fade" visible={isVisible} transparent>
      <StyledView className="flex-1">
        <StyledView className="absolute top-0 left-0 w-full h-full bg-black opacity-70" />
        <StyledView className="bg-white shadow-lg  p-4 w-[80%] rounded-md my-auto flex justify-center items-center mx-auto">
          <StyledText className="text-lg py-2">{title}</StyledText>
          {children}
        </StyledView>
      </StyledView>
    </Modal>
  );
};

export default CustomModal;
