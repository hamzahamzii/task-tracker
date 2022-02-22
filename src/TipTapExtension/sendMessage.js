import { Extension } from "tiptap";

//Set our custom action on enter, update tiptap default behaviour
export default class SendMessage extends Extension {
  keys() {
    return {
      Enter: (state) => {
        // get current active item
        let { $head, $from, $to, node } = state.selection;
        if (
          !(
            (node && node.isBlock) ||
            $from.depth < 2 ||
            !$from.sameParent($to)
          ) ||
          $head.parent.type.name == "code_block"
        ) {
          // in case of list and code return enter default behaviour
          return false;
        }
        // call send message action and stop default behaviour
        else {
          this.options.sendMessage();
          return true;
        }
      },
    };
  }
}
