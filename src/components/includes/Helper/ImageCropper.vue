<template>
  <div>
    <div class="d-flex justify-center">
      <vue-cropper
        :alt="alt"
        :auto-crop-area="0.8"
        :background="true"
        :cropBoxResizable="resizeable"
        :guides="false"
        :imgStyle="imgStyle"
        :maxHeight="cropHeight"
        :maxWidth="cropWidth"
        :min-container-height="cropHeight"
        :min-container-width="cropWidth"
        :minCropBoxHeight="cropHeight"
        :minCropBoxWidth="cropWidth"
        :scalable="false"
        :src="imgSrc"
        :view-mode="3"
        dragMode="none"
        ref="cropper"
        style="{ 'width': 'auto', 'height': 'auto' }"
      >
      </vue-cropper>
    </div>
    <br />
    <v-layout class="justify-center">
      <v-tooltip color="#302277" bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            @click="cropImage"
            depressed
            fab
            small
            class="ml-n10 mt-n4"
            v-on="on"
          >
            <v-icon class="logo-text-color" small>mdi-crop </v-icon>
          </v-btn>
        </template>
        <span>Crop Image</span>
      </v-tooltip>
    </v-layout>
  </div>
</template>

<script>
import VueCropper from "vue-cropperjs";
export default {
  name: "ImageCropper",
  components: {
    VueCropper,
  },
  props: ["imgSrc", "cropWidth", "cropHeight", "alt", "imgStyle", "resizeable"],
  data() {
    return {
      cropImg: "",
    };
  },
  methods: {
    cropImage() {
      this.cropImg = this.$refs.cropper.getCroppedCanvas().toDataURL();
      this.$emit("croped_file", this.cropImg);
    },
  },
};
</script>
