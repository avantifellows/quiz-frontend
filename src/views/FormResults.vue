<template>
    <div class="h-full">
        <!-- Header -->
        <div class="flex w-full justify-center  bg-white p-4">
            <img src="../assets/images/jnvEnableLogo.png"/>
        </div>
        <div class="flex flex-col items-center justify-center p-10">
            <div class="box-border bg-gray-100 rounded-lg p-6">
                <p class="font-bold underline text-lg">PLEASE READ THE FOLLOWING INSTRUCTIONS CAREFULLY</p>
                <ul class="list-decimal p-3">
                    <li>Please fill the Name, Phone Number, and Date of Birth correctly and submit to access results.</li>
                    <li>Ensure that what you fill matches the name, phone number, and date of birth that you filled in registration form.</li>
                    <li>Test Details:
                        <ul class="list-disc">
                            <li>Class 11 JEE: 120 minutes, 30 questions (120 marks)</li>
                            <li>Class 12 JEE: 180 minutes, 75 questions (300 marks)</li>
                            <li>Class 11 NEET: 120 minutes, 30 questions (120 marks)</li>
                            <li>Class 12 NEET: 180 minutes, 180 questions (720 marks)</li>
                        </ul>
                    </li>
                    <li>Scoring Pattern -- Correct Answer: +4, Wrong Answer: -1, Skipped: 0</li>
                    <li>In case of any error, please contact Avanti JNV Team (+91 7259707090)</li>
                </ul>
            </div>
            <p class="text-2xl pt-2 pb-4">JNV Enable Test - Results</p>
            <FormKit
        type="form"
        :config="{ validationVisibility: 'submit' }"
        @submit="submitFormResults"
        v-if="!displayResultBox"
        >
        <FormKit
            type="text"
            label="*Name"
            validation="required|alpha_spaces|length:3,40"
            v-model="studentName"
            validation-visibility="live"
            name="name"
            help="Enter your full name. Example: Karn Mathur"
        />
        <!-- We override validation-visibility for the input below: -->
        <FormKit
            type="tel"
            label="*Phone Number"
            validation="required|matches:/^[0-9]{10}$/"
            validation-visibility="live"
            v-model="phoneNumber"
            name="number"
            help="Please enter a valid mobile number. Example: 9848022335"
        />
        <FormKit
            type="group"
            v-model="dateOfBirth"
            name="dob"
        >
        <div class="flex flex-row space-x-5">
            <FormKit
            type="select"
            label="*Month"
            name="month"
            placeholder="Month"
            :options="monthList"
            validation="required"
            help="Select your Date of Birth."
            />
            <FormKit
            type="select"
            name="day"
            label="*Day"
            placeholder="Day"
            :options="dayList"
            validation="required"
            />
            <FormKit
            type="select"
            name="year"
            label="*Year"
            placeholder="Year"
            :options="yearList"
            validation="required"
            />
        </div>
        </FormKit>
        <div v-if="redirect">
            <p class="font-bold">Please fill the below details and click Submit to view Results</p>
            <FormKit
            type="select"
            label="*Gender"
            placeholder="Select your gender"
            :options="['Male', 'Female', 'Other']"
            validation="required"
            name="gender"
            help="Select your gender."
        />
        <FormKit
            type="text"
            label="*Father's Name"
            validation="required|alpha_spaces|length:3,40"
            name="father_name"
            validation-visibility="live"
            help="Enter your father's full name."
        />
        <FormKit
            type="text"
            label="*Mother's Name"
            validation="required|alpha_spaces|length:3,40"
            name="mother_name"
            validation-visibility="live"
            help="Enter your mother's full name."
        />
        <FormKit
            type="select"
            label="*Category"
            placeholder="Select your category"
            :options="['General', 'General-EWS', 'OBC', 'SC', 'ST']"
            validation="required"
            name="category"
            help="Select your category. Example: OBC"
        />
        <FormKit
            type="select"
            label="*Physically Handicapped"
            placeholder="Physically handicapped?"
            :options="['Yes', 'No']"
            validation="required"
            name="physically_handicapped"
            help="Please select Yes if you are physically handicapped"
        />
        <FormKit
            type="select"
            label="*Region"
            placeholder="Select your region"
            :options="['Bhopal', 'Chandigarh', 'Hyderabad', 'Jaipur', 'Lucknow', 'Patna', 'Pune', 'Shillong']"
            validation="required"
            name="region"
            v-model="region"
            help="Please select your JNV's region. Example: Shillong"
        />
        <FormKit
            type="select"
            label="*State"
            placeholder="Select your state"
            :options="stateList || []"
            validation="required"
            v-model="stateName"
            name="state"
            help="Please select your JNV's state. Example: Sikkim"
        />
        <FormKit
            type="text"
            label="*City/Town"
            validation="required|alpha_spaces|length:3,30"
            validation-visibility="live"
            name="city"
            help="Enter your city's name. Example: Hyderabad"
        />
        <FormKit
            type="select"
            label="*School Name"
            placeholder="Select your JNV's name"
            :options="jnvList || []"
            validation="required"
            name="school"
            help="Please select your JNV's name. Example: JNV Bidar"
        />
        <FormKit
            type="select"
            label="*Course"
            placeholder="Which course?"
            :options="['JEE', 'NEET']"
            validation="required"
            v-model="course"
            name="course"
            help="Please select your course: JEE or NEET"
        />
        <FormKit
            type="select"
            label="*Stream"
            placeholder="Select your stream"
            :options="streamList"
            validation="required"
            name="stream"
            help="Please select your stream. Example: PCM (Physics, Chemistry, Math)"
        />
        <FormKit
            type="select"
            label="*Grade"
            placeholder="Select your grade"
            :options="['11', '12']"
            v-model="grade"
            validation="required"
            name="grade"
            help="Select 12 if you are in 12th grade/class"
        />
        <FormKit
            type="email"
            label="Email Address"
            validation="email"
            validation-visibility="live"
            name="email"
            help="Enter a valid email address if you have one. Example: karn.mathur@gmail.com"
        />
        <FormKit
            type="tel"
            label="*Family Income per Annum"
            validation="required|number|length:1,10"
            validation-visibility="live"
            name="family_income"
            help="Please enter your family income per annum (year) in digits. Example: 100000"
        />
        </div>
        </FormKit>
        <div class="box-border border-1 border-black rounded-lg p-6" v-if="displayResultBox">
                <ul class="list-desc p-3">
                    <li>{{response}}</li>
                    <br/>
                    <li v-if="resultsExist && !redirect"><a class="font-bold no-underline hover:underline" :href=resultsLink>{{ testName }}</a></li>
                </ul>
            </div>
        <button v-if="displayResultBox" @click="displayForm" class="bg-transparent text-blue-700 font-semibold py-2 px-4">
            Go Back
        </button>
        </div>
        </div>
  </template>

<script lang="ts">
// import { useRouter } from "vue-router";
import { defineComponent, reactive, toRefs, computed } from "vue";
import FormDataAPI from "../services/API/FormInputHandling";
import { jnvState } from "../assets/json/statesToJnv"
import { regionState } from "../assets/json/regionsToState"

export default defineComponent({
  name: "FormInput",
  setup() {
    // const router = useRouter();

    const state = reactive({
      region: "",
      course: "",
      grade: "",
      stateName: "",
      studentName: "",
      phoneNumber: "",
      dateOfBirth: "",
      monthList: Array.from({ length: 12 }, (_, i) => i + 1),
      dayList: Array.from({ length: 31 }, (_, i) => i + 1),
      yearList: Array.from({ length: 30 }, (_, i) => i + 1989).reverse(),
      resultsExist: false,
      resultsLink: "",
      redirect: false,
      testName: "",
      response: "",
      displayResultBox: false,
    });

    const studentId = computed(() => {
      return state.phoneNumber + "_" + state.studentName.replaceAll(" ", "").toLowerCase().substring(0, 10);
    });

    async function submitFormResults(formData : any) {
      // check if good submission
      let responseData;
      if (state.redirect == true) {
        responseData = await FormDataAPI.submitFormData(formData, false);
        state.displayResultBox = true;
        state.redirect = false;
        state.response = "Check your results here!";
      } else {
        responseData = await FormDataAPI.submitFormData(formData, true);
        state.resultsExist = responseData.all_results_exist;
        state.resultsLink = responseData.result_link;
        if (responseData.redirect == true) {
          state.displayResultBox = false;
        } else {
          state.displayResultBox = true;
        }
        state.redirect = responseData.redirect;
        state.testName = responseData.test_name;
        state.response = responseData.response;
      }
    };

    async function displayForm() {
      state.displayResultBox = false;
    }

    const stateList = computed(() => {
      return regionState[state.region];
    })

    const jnvList = computed(() => {
      return jnvState[state.stateName];
    });

    const streamList = computed(() => {
      if (state.course == "JEE") {
        return ["PCM", "PCMB"]
      } else {
        return ["PCB", "PCMB"]
      }
    });

    return {
      ...toRefs(state),
      studentId,
      submitFormResults,
      displayForm,
      stateList,
      jnvList,
      streamList,
    };
  },
});
</script>
