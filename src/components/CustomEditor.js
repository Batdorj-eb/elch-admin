import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Bold, Italic, Underline, Strikethrough } from '@ckeditor/ckeditor5-basic-styles';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Image, ImageUpload, ImageToolbar, ImageStyle } from '@ckeditor/ckeditor5-image';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent';
import { FontColor, FontBackgroundColor, FontSize, FontFamily } from '@ckeditor/ckeditor5-font';

class CustomEditor extends ClassicEditor {}

CustomEditor.builtinPlugins = [
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  List,
  Heading,
  BlockQuote,
  Image,
  ImageUpload,
  ImageToolbar,
  ImageStyle,
  Table,
  TableToolbar,
  MediaEmbed,
  Indent,
  IndentBlock,
  FontColor,           // ✨ Текстийн өнгө
  FontBackgroundColor, // ✨ Текстийн арын өнгө
  FontSize,            // ✨ Үсгийн хэмжээ
  FontFamily           // ✨ Фонт
];

export default CustomEditor;