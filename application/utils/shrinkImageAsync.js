
import * as ImageManipulator from 'expo-image-manipulator';

export default reduceImageAsync = async (uri) => {

  const image = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 500 } }], {
    compress: 0.5,
  });
  return image;
}
