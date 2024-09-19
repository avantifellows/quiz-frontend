<template>
  <div class="h-full">
    <!-- Header -->
    <div class="flex w-full justify-center bg-white p-4">
      <img src="../assets/images/jnvEnableLogo.png" />
    </div>
    <!-- Locale Picker -->
    <div class="flex justify-center p-4">
      <LocalePicker
        :options="localeOptions"
        :currentLocale="currentLocale"
        @update:locale="handleLocaleChange"
      />
    </div>
    <div class="flex flex-col items-center justify-center p-10">
      <div class="box-border bg-gray-100 rounded-lg p-6">
        <p class="font-bold underline text-lg">
          {{ $t("instructions.header") }}
        </p>
        <ol class="p-3">
          <li>{{ $t("instructions.Instruction1") }}</li>
          <li>{{ $t("instructions.Instruction2") }}</li>
          <li>{{ $t("instructions.Instruction3") }}</li>
          <li>{{ $t("instructions.Instruction4") }}</li>
          <li>{{ $t("instructions.Instruction5") }}</li>
          <li>{{ $t("instructions.Instruction6") }}</li>
          <li>{{ $t("instructions.Instruction7") }}</li>
          <li>{{ $t("instructions.Instruction8") }}</li>
          <li>{{ $t("instructions.Instruction9") }}</li>
          <li>{{ $t("instructions.Instruction10") }}</li>
        </ol>
      </div>
      <FormKit
        type="form"
        :config="{ validationVisibility: 'submit' }"
        @submit="submitForm"
      >
        <FormKit
          type="text"
          :label="$t('formLabels.name')"
          validation="required|alpha_spaces|length:3,40"
          v-model="studentName"
          validation-visibility="live"
          name="name"
          :help="$t('formHints.name')"
        />
        <FormKit
          type="select"
          :label="$t('formLabels.gender')"
          placeholder="Select your gender"
          :options="['Male', 'Female', 'Other']"
          validation="required"
          name="gender"
          :help="$t('formHints.gender')"
        />
        <FormKit type="group" v-model="dateOfBirth" name="dob">
          <div class="flex flex-row space-x-5">
            <FormKit
              type="select"
              :label="$t('formLabels.month')"
              name="month"
              v-model="month"
              placeholder="Month"
              :options="monthList"
              validation="required"
              :help="$t('formHints.dob')"
            />
            <FormKit
              type="select"
              name="day"
              v-model="day"
              :label="$t('formLabels.day')"
              placeholder="Day"
              :options="dayList"
              validation="required"
            />
            <FormKit
              type="select"
              name="year"
              v-model="year"
              :label="$t('formLabels.year')"
              placeholder="Year"
              :options="yearList"
              validation="required"
            />
          </div>
        </FormKit>
        <FormKit
          type="text"
          :label="$t('formLabels.fatherName')"
          validation="required|alpha_spaces|length:3,40"
          name="father_name"
          validation-visibility="live"
          :help="$t('formHints.fatherName')"
        />
        <FormKit
          type="text"
          :label="$t('formLabels.motherName')"
          validation="required|alpha_spaces|length:3,40"
          name="mother_name"
          validation-visibility="live"
          :help="$t('formHints.motherName')"
        />
        <FormKit
          type="select"
          :label="$t('formLabels.category')"
          placeholder="Select your category"
          :options="['General', 'General-EWS', 'OBC', 'SC', 'ST']"
          validation="required"
          name="category"
          :help="$t('formHints.category')"
        />
        <FormKit
          type="select"
          :label="$t('formLabels.physicallyHandicapped')"
          placeholder="Physically handicapped?"
          :options="['Yes', 'No']"
          validation="required"
          name="physically_handicapped"
          :help="$t('formHints.physicallyHandicapped')"
        />
        <FormKit
          type="select"
          :label="$t('formLabels.region')"
          placeholder="Select your region"
          :options="[
            'Bhopal',
            'Chandigarh',
            'Hyderabad',
            'Jaipur',
            'Lucknow',
            'Patna',
            'Pune',
            'Shillong',
          ]"
          validation="required"
          name="region"
          v-model="region"
          :help="$t('formHints.region')"
        />
        <FormKit
          type="select"
          :label="$t('formLabels.state')"
          placeholder="Select your state"
          :options="stateList || []"
          validation="required"
          v-model="stateName"
          name="state"
          :help="$t('formHints.state')"
        />
        <FormKit
          type="text"
          :label="$t('formLabels.city')"
          validation="required|alpha_spaces|length:3,30"
          validation-visibility="live"
          name="city"
          :help="$t('formHints.city')"
        />
        <FormKit
          type="select"
          :label="$t('formLabels.school')"
          placeholder="Select your JNV's name"
          :options="jnvList || []"
          validation="required"
          name="school"
          :help="$t('formHints.school')"
        />
        <FormKit
          type="select"
          :label="$t('formLabels.course')"
          placeholder="Which course?"
          :options="['JEE', 'NEET']"
          validation="required"
          v-model="course"
          name="course"
          :help="$t('formHints.course')"
        />
        <FormKit
          type="select"
          :label="$t('formLabels.stream')"
          placeholder="Select your stream"
          :options="streamList"
          validation="required"
          name="stream"
          :help="$t('formHints.stream')"
        />
        <FormKit
          type="select"
          :label="$t('formLabels.grade')"
          placeholder="Select your grade"
          :options="['11', '12']"
          v-model="grade"
          validation="required"
          name="grade"
          :help="$t('formHints.grade')"
        />
        <FormKit
          type="email"
          :label="$t('formLabels.email')"
          validation="email"
          validation-visibility="live"
          name="email"
          :help="$t('formHints.email')"
        />
        <FormKit
          type="tel"
          :label="$t('formLabels.phoneNumber')"
          validation="required|matches:/^[0-9]{10}$/"
          validation-visibility="live"
          v-model="phoneNumber"
          name="number"
          :help="$t('formHints.phoneNumber')"
        />
        <FormKit
          type="tel"
          :label="$t('formLabels.familyIncome')"
          validation="required|number|length:1,10"
          validation-visibility="live"
          name="family_income"
          :help="$t('formHints.familyIncome')"
        />
      </FormKit>
    </div>
  </div>
</template>
<script lang="ts">
import { useRouter } from "vue-router";
import { defineComponent, reactive, toRefs, computed } from "vue";
import { jnvState } from "../assets/json/statesToJnv";
import { regionState } from "../assets/json/regionsToState";
import FormDataAPI from "../services/API/FormInputHandling";
import LocalePicker from "@/components/LocalePicker.vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "FormInput",
  components: {
    LocalePicker,
  },
  setup() {
    const { t, locale } = useI18n();
    const router = useRouter();
    console.log("Current Locale:", locale.value); // Check current locale
    const state = reactive({
      region: "",
      course: "",
      grade: "",
      stateName: "",
      studentName: "",
      phoneNumber: "",
      dateOfBirth: "",
      month: "",
      day: "",
      year: "",
      monthList: Array.from({ length: 12 }, (_, i) => i + 1),
      dayList: Array.from({ length: 31 }, (_, i) => i + 1),
      yearList: Array.from({ length: 30 }, (_, i) => i + 1989).reverse(),
      currentLocale: locale.value,
    });

    const userId = computed(() => {
      const month = state.month.toString().padStart(2, "0");
      const day = state.day.toString().padStart(2, "0");
      return state.phoneNumber + "_" + month + day + state.year;
    });

    const quizId = computed(() => {
      if (state.course == "JEE" && state.grade == "11") {
        return "6377941c33f566cae7acf465";
      } else if (state.course == "JEE" && state.grade == "12") {
        return "6377943a33f566cae7acf568";
      } else if (state.course == "NEET" && state.grade == "11") {
        return "6377942e33f566cae7acf4b2";
      } else {
        return "6377956e33f566cae7acf6eb";
      }
    });

    const stateList = computed(() => {
      return regionState[state.region];
    });

    const jnvList = computed(() => {
      return jnvState[state.stateName];
    });

    const streamList = computed(() => {
      if (state.course == "JEE") {
        return ["PCM", "PCMB"];
      } else {
        return ["PCB", "PCMB"];
      }
    });

    const localeOptions = [
      { code: "en", label: "English" },
      { code: "hi", label: "हिन्दी" },
      // Add more languages as needed
    ];

    const handleLocaleChange = (newLocale: any) => {
      state.currentLocale = newLocale;
      locale.value = newLocale;
      // Update vue-i18n locale here if needed
    };

    const submitForm = async (formData: any) => {
      // check if good submission
      await FormDataAPI.submitFormData(formData);
      router.push({
        name: "Player",
        params: { quizId: quizId.value },
        query: { userId: userId.value, apiKey: "6qOO8UdF1EGxLgzwIbQN" },
      });
    };

    return {
      ...toRefs(state),
      stateList,
      jnvList,
      streamList,
      quizId,
      userId,
      submitForm,
      localeOptions,
      currentLocale: computed(() => state.currentLocale),
      handleLocaleChange,
      t,
    };
  },
});
</script>
