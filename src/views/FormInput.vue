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
                    <li>Please fill the form correctly and submit to access the test.</li>
                    <li>Please select your course and grade correctly to access the right test.</li>
                    <li>Test Details:
                        <ul class="list-disc">
                            <li>Class 11 JEE: 120 minutes, 75 questions (300 marks)</li>
                            <li>Class 12 JEE: 180 minutes, 75 questions (300 marks)</li>
                            <li>Class 11 NEET: 120 minutes, 180 questions (720 marks)</li>
                            <li>Class 12 NEET: 180 minutes, 180 questions (720 marks)</li>
                        </ul>
                    </li>
                    <li>Scoring Pattern -- Correct Answer: +4, Wrong Answer: -1, Skipped: 0</li>
                    <li class="text-red-600">During the test, to confirm your answer please click <b>SAVE & NEXT</b>. Your response to a question will not be considered incase you fail to save your answer.</li>
                    <li>Only press <b>END TEST</b> once you have completed and reviewed your answers. You will not be able to change your responses once you click on <b>END TEST</b></li>
                </ul>
            </div>
            <p class="text-2xl pt-2 pb-4">JNV Enable Test - Registration Form</p>
            <FormKit
        type="form"
        :config="{ validationVisibility: 'submit' }"
        @submit="submitForm"
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
            type="group"
            v-model="dateOfBirth"
            name="dob"
        >
        <div class="flex flex-row space-x-5">
            <FormKit
            type="select"
            label="*Month"
            name="month"
            v-model="month"
            placeholder="Month"
            :options="monthList"
            validation="required"
            help="Select your Date of Birth."
            />
            <FormKit
            type="select"
            name="day"
            v-model="day"
            label="*Day"
            placeholder="Day"
            :options="dayList"
            validation="required"
            />
            <FormKit
            type="select"
            name="year"
            v-model="year"
            label="*Year"
            placeholder="Year"
            :options="yearList"
            validation="required"
            />
        </div>
        </FormKit>
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
        <!-- <FormKit
            type="select"
            label="*Who owns the above phone?"
            placeholder="Primary SmartPhone Owner"
            :options="['Student', 'Father', 'Mother', 'Sibling', 'Other']"
            validation="required"
            name="primary_smartphone_owner"
            help="If you own the phone, select 'Student'.
            If your brother/sister owns the phone, select 'Sibling'"
        /> -->
        <FormKit
            type="tel"
            label="*Family Income per Annum"
            validation="required|number|length:1,10"
            validation-visibility="live"
            name="family_income"
            help="Please enter your family income per annum (year) in digits. Example: 100000"
        />
        <!-- <FormKit
            type="select"
            label="*Parent/Guardian's Profession"
            placeholder="Select your guardian's profession"
            :options="['Government', 'Non Government', 'Daily Wage', 'Other']"
            validation="required"
            name="guardian_profession"
            help="If your father/mother/guardian work in a govt job, select 'Government'"
        />
        <FormKit
            type="select"
            label="*Parent/Guardian's Education Level"
            placeholder="Guardian's Education Level"
            :options="['Untutored', 'Under Matriculation', 'Matriculation', 'Graduation', 'Post Graduation', 'Doctoral']"
            validation="required"
            name="guardian_education_level"
            help="If your father/mother/guardian studied till matriculation, select 'Matriculation'"
        /> -->
            </FormKit>
        </div>
        </div>
  </template>

<script lang="ts">
import { useRouter } from "vue-router";
import { defineComponent, reactive, toRefs, computed } from "vue";
import { jnvState } from "../assets/json/statesToJnv"
import { regionState } from "../assets/json/regionsToState"
import FormDataAPI from "../services/API/FormInputHandling";

export default defineComponent({
  name: "FormInput",
  setup() {
    const router = useRouter();

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
    });

    const userId = computed(() => {
      const month = state.month.toString().padStart(2, '0');
      const day = state.day.toString().padStart(2, '0');
      return state.phoneNumber + "_" + month + day + state.year;
    });

    const quizId = computed(() => {
      if (state.course == "JEE" && state.grade == "11") {
        return "6377941c33f566cae7acf465";
      } else if (state.course == "JEE" && state.grade == "12") {
        return "6377943a33f566cae7acf568"
      } else if (state.course == "NEET" && state.grade == "11") {
        return "6377942e33f566cae7acf4b2";
      } else {
        return "6377956e33f566cae7acf6eb";
      }
    });

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

    const submitForm = async (formData : any) => {
      // check if good submission
      await FormDataAPI.submitFormData(formData);
      router.push({ name: 'Player', params: { quizId: quizId.value }, query: { userId: userId.value, apiKey: "6qOO8UdF1EGxLgzwIbQN" } })
    };

    return {
      ...toRefs(state),
      stateList,
      jnvList,
      streamList,
      quizId,
      userId,
      submitForm
    };
  },
});
</script>
